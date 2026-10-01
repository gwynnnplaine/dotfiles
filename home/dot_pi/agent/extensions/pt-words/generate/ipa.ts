/**
 * Converts European Portuguese IPA (Wiktionary, Portugal-tagged) into a rough
 * Ukrainian Cyrillic reading hint. Stress is an acute accent on the stressed
 * vowel (omitted for one-syllable words), nasal vowels get a trailing `(н)` (a faint н through the nose),
 * and a word-final reduced `ɨ` is dropped because Lisbon speech drops it.
 */

export type IpaResult = { readonly ok: true; readonly say: string } | { readonly ok: false; readonly unknown: string };

const STRESS = "\u0301";
const NASAL = "\u0303";

type Nasality = "oral" | "nasal";

type Segment =
	| { readonly kind: "vowel"; readonly cyr: string; readonly nasality: Nasality; readonly stress: "stressed" | "unstressed"; readonly isReduced: boolean }
	| { readonly kind: "glide"; readonly sound: "j" | "w"; readonly nasality: Nasality }
	| { readonly kind: "consonant"; readonly cyr: string; readonly palatal: "ɲ" | "ʎ" | undefined };

const VOWELS: Readonly<Record<string, string>> = {
	a: "а",
	ɐ: "а",
	ɑ: "а",
	ə: "е",
	ɨ: "и",
	e: "е",
	ɛ: "е",
	i: "і",
	ɪ: "і",
	o: "о",
	ɔ: "о",
	u: "у",
	ʊ: "у",
	ɯ: "и",
};

const CONSONANTS: Readonly<Record<string, string>> = {
	p: "п",
	b: "б",
	β: "б",
	t: "т",
	d: "д",
	ð: "д",
	k: "к",
	g: "ґ",
	ɡ: "ґ",
	ɣ: "ґ",
	f: "ф",
	v: "в",
	s: "с",
	z: "з",
	ʃ: "ш",
	ʒ: "ж",
	m: "м",
	n: "н",
	ŋ: "н",
	ɱ: "м",
	l: "л",
	ɫ: "л",
	ɾ: "р",
	r: "р",
	ʁ: "р",
	ʀ: "р",
	χ: "р",
	x: "х",
	h: "х",
};

const IGNORED = new Set([".", "‿", "ː", "ˌ", "-", " ", "\u031E", "\u031D", "\u0320", "\u031F", "\u032A", "\u0325", "\u032F", "\u0306", "\u02B2", "\u02B7", "\u0361", "\u035C"]);

const IOTATED: Readonly<Record<string, string>> = { а: "я", е: "є", у: "ю", і: "ї", о: "йо", и: "ї" };
const SOFTENED: Readonly<Record<string, string>> = { а: "я", е: "е", у: "ю", і: "і", о: "ьо", и: "і" };

const isVowel = (segment: Segment | undefined): boolean => segment?.kind === "vowel";

function stripOptional(ipa: string): string {
	return ipa.replace(/\([^)]*\)/g, "");
}

function bare(ipa: string): string {
	const trimmed = (ipa.split("|")[0] ?? "").trim();
	return trimmed.replace(/^[/[]/, "").replace(/[/\]]$/, "");
}

function tokenize(ipa: string): { readonly segments: readonly Segment[]; readonly unknown: string | undefined } {
	const chars = [...stripOptional(bare(ipa)).normalize("NFD")];
	const segments: Segment[] = [];
	let isStressNext = false;
	for (let i = 0; i < chars.length; i += 1) {
		const char = chars[i] ?? "";
		const nasality: Nasality = chars[i + 1] === NASAL ? "nasal" : "oral";
		if (char === "ˈ" || char === "'") {
			isStressNext = true;
			continue;
		}
		if (char === NASAL || IGNORED.has(char)) {
			continue;
		}
		const vowel = VOWELS[char];
		if (vowel !== undefined) {
			segments.push({ kind: "vowel", cyr: vowel, nasality, stress: isStressNext ? "stressed" : "unstressed", isReduced: char === "ɨ" });
			isStressNext = false;
			continue;
		}
		if (char === "j" || char === "w") {
			segments.push({ kind: "glide", sound: char, nasality });
			continue;
		}
		if (char === "ɲ" || char === "ʎ") {
			segments.push({ kind: "consonant", cyr: char === "ɲ" ? "н" : "л", palatal: char });
			continue;
		}
		const consonant = CONSONANTS[char];
		if (consonant !== undefined) {
			segments.push({ kind: "consonant", cyr: consonant, palatal: undefined });
			continue;
		}
		return { segments, unknown: char };
	}
	return { segments, unknown: undefined };
}

function vowelLetter(segments: readonly Segment[], index: number, cyr: string): string {
	const previous = segments[index - 1];
	if (previous?.kind === "glide" && previous.sound === "j") {
		const iotated = IOTATED[cyr] ?? cyr;
		return segments[index - 2]?.kind === "consonant" ? `'${iotated}` : iotated;
	}
	if (previous?.kind === "consonant" && previous.palatal !== undefined) {
		return SOFTENED[cyr] ?? cyr;
	}
	return cyr;
}

export function ipaToCyrillic(ipa: string): IpaResult {
	const { segments, unknown } = tokenize(ipa);
	if (unknown !== undefined) {
		return { ok: false, unknown };
	}
	const vowelCount = segments.filter(isVowel).length;
	const last = segments[segments.length - 1];
	const hasDroppedFinal = last?.kind === "vowel" && last.isReduced && vowelCount > 1;
	const shouldMarkStress = vowelCount - (hasDroppedFinal ? 1 : 0) > 1;
	let out = "";
	let hasPendingNasal = false;

	segments.forEach((segment, index) => {
		const next = segments[index + 1];
		switch (segment.kind) {
			case "consonant":
				out += segment.cyr;
				if (segment.palatal !== undefined && !isVowel(next) && next?.kind !== "glide") {
					out += "ь";
				}
				return;
			case "glide":
				if (segment.sound === "w") {
					out += "у";
				} else if (!isVowel(next)) {
					out += "й";
				}
				if (hasPendingNasal && !(next?.kind === "glide" && next.nasality === "nasal")) {
					out += "(н)";
					hasPendingNasal = false;
				}
				return;
			case "vowel": {
				if (hasDroppedFinal && index === segments.length - 1) {
					return;
				}
				const letter = vowelLetter(segments, index, segment.cyr);
				out += shouldMarkStress && segment.stress === "stressed" ? `${letter}${STRESS}` : letter;
				if (segment.nasality === "nasal") {
					if (next?.kind === "glide" && next.nasality === "nasal") {
						hasPendingNasal = true;
					} else {
						out += "(н)";
					}
				}
				return;
			}
		}
	});
	if (hasPendingNasal) {
		out += "(н)";
	}
	return { ok: true, say: out.normalize("NFC") };
}
