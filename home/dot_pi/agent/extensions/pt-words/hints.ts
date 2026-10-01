/**
 * One short pronunciation hint for the sound in a word that a Ukrainian
 * speaker is most likely to get wrong. Rules are checked in priority order;
 * the first match wins, so the widget never shows more than one hint.
 */

import type { Word } from "./core.ts";

interface HintRule {
	readonly matches: (word: Word) => boolean;
	readonly hint: string;
}

const ipaOf = (word: Word): string => (word.ipa ?? "").normalize("NFD");

const RULES: readonly HintRule[] = [
	{ matches: (word) => ipaOf(word).includes("\u0303"), hint: "(н) — через ніс, язик не торкається піднебіння" },
	{ matches: (word) => /ʁ/.test(ipaOf(word)), hint: "r/rr тут — горлове р, як французьке" },
	{ matches: (word) => word.id.includes("lh"), hint: "lh — мʼяке ль, як у «льон»" },
	{ matches: (word) => word.id.includes("nh"), hint: "nh — нь, як у «няня»" },
	{ matches: (word) => /s(?=[^aeiouáéíóúâêôãõà\s]|$)/u.test(word.id) && ipaOf(word).includes("ʃ"), hint: "s перед приголосним і в кінці — ш" },
	{ matches: (word) => /e$/.test(word.id) && /ɨ[/\]]?$/.test(ipaOf(word)), hint: "кінцеве e майже не чути" },
	{ matches: (word) => word.id.includes("ç"), hint: "ç — завжди с" },
	{ matches: (word) => /o$/.test(word.id) && /u[/\]]?$/.test(ipaOf(word)), hint: "кінцеве o звучить як у" },
];

export function hintOf(word: Word): string | undefined {
	return RULES.find((rule) => rule.matches(word))?.hint;
}
