/**
 * Step 1 of the curriculum build. Joins a subtitle frequency list
 * (hermitdave/FrequencyWords, `pt` = Portugal) with the Wiktionary dump from
 * kaikki.org, folds inflected forms into their lemma, drops names, articles,
 * and Brazil-only words, and writes ranked candidates with Portugal IPA and
 * English glosses for the translation step.
 *
 * Usage: node extract.ts <pt_50k.txt> <kaikki-Portuguese.jsonl> <out.json> <limit>
 */

import { createReadStream, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

export interface Entry {
	readonly pos: string;
	readonly formOf: readonly string[];
	readonly glosses: readonly string[];
	readonly ipa: string | undefined;
	readonly isBrazilOnly: boolean;
}

export interface Candidate {
	readonly pt: string;
	readonly score: number;
	readonly pos: readonly string[];
	readonly ipa: string | undefined;
	readonly glosses: readonly string[];
}

const EXCLUDED_POS = new Set(["name", "character", "symbol", "prefix", "suffix", "infix", "interfix", "affix", "punct", "article", "abbrev", "romanization"]);
const PORTUGAL_TAGS = new Set(["Portugal", "Lisbon", "European-Portuguese"]);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const asArray = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);
const stringsOf = (value: unknown): readonly string[] => asArray(value).filter((item): item is string => typeof item === "string");

/** Parses one kaikki line into the fields this build needs; anything unexpected yields `undefined`. */
export function parseEntry(raw: unknown): { readonly word: string; readonly entry: Entry } | undefined {
	if (!isRecord(raw) || typeof raw.word !== "string" || typeof raw.pos !== "string") {
		return undefined;
	}
	const senses = asArray(raw.senses).filter(isRecord);
	const formOf = senses.flatMap((sense) =>
		asArray(sense.form_of)
			.filter(isRecord)
			.flatMap((target) => (typeof target.word === "string" ? [target.word] : [])),
	);
	const glosses = senses
		.filter((sense) => asArray(sense.form_of).length === 0 && !stringsOf(sense.tags).includes("form-of"))
		.flatMap((sense) => stringsOf(sense.glosses).slice(-1))
		.slice(0, 3);
	const isBrazilOnly = senses.length > 0 && senses.every((sense) => stringsOf(sense.tags).includes("Brazil"));
	const portugalSounds = asArray(raw.sounds)
		.filter(isRecord)
		.filter((sound) => typeof sound.ipa === "string" && stringsOf(sound.tags).some((tag) => PORTUGAL_TAGS.has(tag)))
		.flatMap((sound) => (typeof sound.ipa === "string" ? [sound.ipa] : []));
	const ipa = portugalSounds.find((sound) => sound.startsWith("/")) ?? portugalSounds[0];
	return { word: raw.word, entry: { pos: raw.pos, formOf, glosses, ipa, isBrazilOnly } };
}

export async function readEntries(path: string, wanted: (word: string) => boolean, into: Map<string, Entry[]>): Promise<void> {
	const lines = createInterface({ input: createReadStream(path), crlfDelay: Number.POSITIVE_INFINITY });
	for await (const line of lines) {
		const parsed = parseEntry(JSON.parse(line));
		if (parsed === undefined || !wanted(parsed.word) || EXCLUDED_POS.has(parsed.entry.pos)) {
			continue;
		}
		const list = into.get(parsed.word) ?? [];
		list.push(parsed.entry);
		into.set(parsed.word, list);
	}
}

/** Decides which lemmas a surface form counts toward. A real (non-form) entry wins unless it is only an interjection. */
export function lemmasOf(word: string, entries: readonly Entry[]): readonly string[] {
	const usable = entries.filter((entry) => !entry.isBrazilOnly);
	const lemmaEntries = usable.filter((entry) => entry.glosses.length > 0);
	const targets = [...new Set(usable.flatMap((entry) => entry.formOf))].filter((target) => target !== word);
	const isOnlyInterjection = lemmaEntries.every((entry) => entry.pos === "intj");
	if (lemmaEntries.length > 0 && !(isOnlyInterjection && targets.length > 0)) {
		return [word];
	}
	return targets;
}

async function main(): Promise<void> {
	const [freqPath, kaikkiPath, outPath, limitArg] = process.argv.slice(2);
	if (freqPath === undefined || kaikkiPath === undefined || outPath === undefined || limitArg === undefined) {
		throw new Error("usage: node extract.ts <freq.txt> <kaikki.jsonl> <out.json> <limit>");
	}
	const limit = Number.parseInt(limitArg, 10);

	const frequency = new Map<string, number>();
	for (const line of readFileSync(freqPath, "utf8").split("\n")) {
		const [word, count] = line.trim().split(" ");
		if (word !== undefined && count !== undefined && /^\p{L}[\p{L}-]*$/u.test(word)) {
			frequency.set(word, Number.parseInt(count, 10));
		}
	}

	const entries = new Map<string, Entry[]>();
	await readEntries(kaikkiPath, (word) => frequency.has(word), entries);

	const scores = new Map<string, number>();
	for (const [word, count] of frequency) {
		const lemmas = lemmasOf(word, entries.get(word) ?? []);
		for (const lemma of lemmas) {
			scores.set(lemma, (scores.get(lemma) ?? 0) + count / lemmas.length);
		}
	}

	const missing = new Set([...scores.keys()].filter((lemma) => !entries.has(lemma)));
	await readEntries(kaikkiPath, (word) => missing.has(word), entries);

	const candidates: Candidate[] = [...scores]
		.sort((a, b) => b[1] - a[1])
		.flatMap(([pt, score]) => {
			const lemmaEntries = (entries.get(pt) ?? []).filter((entry) => !entry.isBrazilOnly && entry.glosses.length > 0);
			if (lemmaEntries.length === 0 || pt.length < 2) {
				return [];
			}
			return [
				{
					pt,
					score: Math.round(score),
					pos: [...new Set(lemmaEntries.map((entry) => entry.pos))],
					ipa: lemmaEntries.find((entry) => entry.ipa !== undefined)?.ipa ?? entries.get(pt)?.find((entry) => entry.ipa !== undefined)?.ipa,
					glosses: lemmaEntries.flatMap((entry) => entry.glosses).slice(0, 3),
				},
			];
		})
		.slice(0, limit);

	writeFileSync(outPath, `${JSON.stringify(candidates, null, "\t")}\n`);
	console.log(`${candidates.length} candidates, ${candidates.filter((c) => c.ipa === undefined).length} without Portugal IPA`);
}

if (import.meta.main) {
	await main();
}
