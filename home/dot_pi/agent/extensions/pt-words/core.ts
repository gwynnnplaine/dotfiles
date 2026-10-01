/**
 * Pure core of pt-words: domain types, the progress parser, and the
 * passive spaced-repetition scheduler. No I/O, no clock, no UI.
 */

export type WordId = string & { readonly __brand: "WordId" };
export type DayKey = string & { readonly __brand: "DayKey" };

/** One European Portuguese entry: the word itself, its Ukrainian meaning, Portugal IPA when Wiktionary has it, and a Cyrillic pronunciation hint. */
export interface Word {
	readonly id: WordId;
	readonly uk: string;
	readonly ipa: string | undefined;
	readonly say: string;
}

/** Exposures already seen while a word is still being learned. */
export type Seen = 1 | 2 | 3 | 4 | 5;

export type CardState =
	| { readonly kind: "learning"; readonly seen: Seen; readonly dueAtMs: number; readonly introducedOn: DayKey }
	| { readonly kind: "retired"; readonly reason: "learned" | "skipped" };

export type Display = "on" | "off";

export interface Progress {
	readonly version: 1;
	readonly display: Display;
	readonly cards: ReadonlyMap<WordId, CardState>;
	readonly current: WordId | undefined;
}

export type Pick =
	| { readonly kind: "review"; readonly word: Word; readonly seen: Seen }
	| { readonly kind: "new"; readonly word: Word }
	| { readonly kind: "rest" };

export type ParseResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** Delay before the next exposure, keyed by exposures seen so far. The exposure after `5` retires the word as learned. */
export const INTERVAL_AFTER: Readonly<Record<Seen, number>> = {
	1: 10 * MINUTE_MS,
	2: 1 * DAY_MS,
	3: 3 * DAY_MS,
	4: 7 * DAY_MS,
	5: 21 * DAY_MS,
};

export const INTERVALS_MS: readonly [number, number, number, number, number] = [
	INTERVAL_AFTER[1],
	INTERVAL_AFTER[2],
	INTERVAL_AFTER[3],
	INTERVAL_AFTER[4],
	INTERVAL_AFTER[5],
];

export const NEW_WORDS_PER_DAY = 5;

export const emptyProgress: Progress = { version: 1, display: "on", cards: new Map(), current: undefined };

/** Smart constructor for curriculum ids; the only place a plain string becomes a WordId. */
export function wordId(pt: string): WordId {
	// SAFETY: brand is nominal only; ids come from the checked-in curriculum or a parsed progress file.
	return pt as WordId;
}

/** Local calendar day, so the daily new-word cap resets at the user's midnight. */
export function dayKeyOf(date: Date): DayKey {
	const pad = (n: number): string => String(n).padStart(2, "0");
	// SAFETY: format is fixed to YYYY-MM-DD right here.
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` as DayKey;
}

export function pickNext(words: readonly Word[], progress: Progress, nowMs: number, today: DayKey): Pick {
	const byId = new Map(words.map((word) => [word.id, word]));

	const due = [...progress.cards]
		.flatMap(([id, card]) => {
			const word = byId.get(id);
			return word !== undefined && card.kind === "learning" && card.dueAtMs <= nowMs ? [{ word, card }] : [];
		})
		.sort((a, b) => a.card.dueAtMs - b.card.dueAtMs);
	const mostOverdue = due[0];
	if (mostOverdue !== undefined) {
		return { kind: "review", word: mostOverdue.word, seen: mostOverdue.card.seen };
	}

	const introducedToday = [...progress.cards.values()].filter(
		(card) => card.kind === "learning" && card.introducedOn === today,
	).length;
	if (introducedToday >= NEW_WORDS_PER_DAY) {
		return { kind: "rest" };
	}

	const fresh = words.find((word) => !progress.cards.has(word.id));
	return fresh === undefined ? { kind: "rest" } : { kind: "new", word: fresh };
}

function nextSeen(seen: Seen): Seen | "done" {
	switch (seen) {
		case 1:
			return 2;
		case 2:
			return 3;
		case 3:
			return 4;
		case 4:
			return 5;
		case 5:
			return "done";
	}
}

/** Records the exposure of a picked word and makes it the displayed one. `rest` keeps the current word on screen without counting an exposure. */
export function expose(progress: Progress, pick: Pick, nowMs: number, today: DayKey): Progress {
	const cards = new Map(progress.cards);
	switch (pick.kind) {
		case "rest":
			return progress;
		case "new":
			cards.set(pick.word.id, { kind: "learning", seen: 1, dueAtMs: nowMs + INTERVAL_AFTER[1], introducedOn: today });
			return { ...progress, cards, current: pick.word.id };
		case "review": {
			const previous = progress.cards.get(pick.word.id);
			const introducedOn = previous?.kind === "learning" ? previous.introducedOn : today;
			const seen = nextSeen(pick.seen);
			cards.set(
				pick.word.id,
				seen === "done"
					? { kind: "retired", reason: "learned" }
					: { kind: "learning", seen, dueAtMs: nowMs + INTERVAL_AFTER[seen], introducedOn },
			);
			return { ...progress, cards, current: pick.word.id };
		}
	}
}

/** Retires the displayed word because the user already knows it. No current word is a no-op. */
export function skipCurrent(progress: Progress): Progress {
	if (progress.current === undefined) {
		return progress;
	}
	const cards = new Map(progress.cards);
	cards.set(progress.current, { kind: "retired", reason: "skipped" });
	return { ...progress, cards, current: undefined };
}

export interface Stats {
	readonly learning: number;
	readonly learned: number;
	readonly skipped: number;
	readonly newToday: number;
	readonly unseen: number;
}

export function statsOf(words: readonly Word[], progress: Progress, today: DayKey): Stats {
	const cards = [...progress.cards.values()];
	return {
		learning: cards.filter((card) => card.kind === "learning").length,
		learned: cards.filter((card) => card.kind === "retired" && card.reason === "learned").length,
		skipped: cards.filter((card) => card.kind === "retired" && card.reason === "skipped").length,
		newToday: cards.filter((card) => card.kind === "learning" && card.introducedOn === today).length,
		unseen: words.filter((word) => !progress.cards.has(word.id)).length,
	};
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSeen(value: unknown): Seen | undefined {
	switch (value) {
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
			return value;
		default:
			return undefined;
	}
}

function parseCard(value: unknown): CardState | undefined {
	if (!isRecord(value)) {
		return undefined;
	}
	if (value.kind === "retired") {
		return value.reason === "learned" || value.reason === "skipped" ? { kind: "retired", reason: value.reason } : undefined;
	}
	if (value.kind !== "learning") {
		return undefined;
	}
	const seen = parseSeen(value.seen);
	const { dueAtMs, introducedOn } = value;
	if (seen === undefined || typeof dueAtMs !== "number" || !Number.isFinite(dueAtMs)) {
		return undefined;
	}
	if (typeof introducedOn !== "string" || !DAY_KEY.test(introducedOn)) {
		return undefined;
	}
	// SAFETY: introducedOn matched the DayKey format above.
	return { kind: "learning", seen, dueAtMs, introducedOn: introducedOn as DayKey };
}

/** Parses the persisted progress file. Unknown future versions and any malformed card fail the whole parse. */
export function parseProgress(raw: unknown): ParseResult<Progress> {
	if (!isRecord(raw)) {
		return { ok: false, error: "progress is not an object" };
	}
	if (raw.version !== 1) {
		return { ok: false, error: `unsupported version ${JSON.stringify(raw.version)}` };
	}
	if (raw.display !== "on" && raw.display !== "off") {
		return { ok: false, error: `invalid display ${JSON.stringify(raw.display)}` };
	}
	if (!isRecord(raw.cards)) {
		return { ok: false, error: "cards is not an object" };
	}
	const cards = new Map<WordId, CardState>();
	for (const [id, value] of Object.entries(raw.cards)) {
		const card = parseCard(value);
		if (card === undefined) {
			return { ok: false, error: `invalid card ${JSON.stringify(id)}` };
		}
		cards.set(wordId(id), card);
	}
	const { current } = raw;
	if (current !== undefined && typeof current !== "string") {
		return { ok: false, error: "current is not a string" };
	}
	return {
		ok: true,
		value: { version: 1, display: raw.display, cards, current: current === undefined ? undefined : wordId(current) },
	};
}

export function serializeProgress(progress: Progress): string {
	return `${JSON.stringify(
		{
			version: progress.version,
			display: progress.display,
			current: progress.current,
			cards: Object.fromEntries(progress.cards),
		},
		null,
		"\t",
	)}\n`;
}
