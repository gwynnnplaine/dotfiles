import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	type DayKey,
	dayKeyOf,
	emptyProgress,
	expose,
	INTERVALS_MS,
	NEW_WORDS_PER_DAY,
	parseProgress,
	pickNext,
	type Progress,
	serializeProgress,
	skipCurrent,
	statsOf,
	type Word,
	wordId,
} from "./core.ts";
import { WORDS } from "./words.ts";

const DAY = dayKeyOf(new Date(2025, 0, 10));
const T0 = new Date(2025, 0, 10, 9).getTime();
const words: readonly Word[] = ["um", "dois", "três", "quatro", "cinco", "seis", "sete"].map((pt) => ({ id: wordId(pt), uk: pt, ipa: undefined, say: pt }));

const step = (progress: Progress, nowMs: number, today: DayKey = DAY): Progress =>
	expose(progress, pickNext(words, progress, nowMs, today), nowMs, today);

const roundTrip = (progress: Progress): Progress => {
	const parsed = parseProgress(JSON.parse(serializeProgress(progress)));
	assert.ok(parsed.ok, parsed.ok ? "" : parsed.error);
	return parsed.value;
};

describe("curriculum", () => {
	it("has unique, non-empty entries", () => {
		assert.equal(new Set(WORDS.map((word) => word.id)).size, WORDS.length);
		for (const word of WORDS) {
			assert.ok(word.id.trim() && word.uk.trim() && word.say.trim(), word.id);
		}
	});
});

describe("scheduler", () => {
	it("introduces words in curriculum order", () => {
		const progress = step(step(emptyProgress, T0), T0 + 1);
		assert.equal(progress.current, words[1]?.id);
	});

	it("caps new words per day, then rests without changing the shown word", () => {
		let progress = emptyProgress;
		for (let i = 0; i < NEW_WORDS_PER_DAY; i += 1) {
			progress = step(progress, T0 + i);
		}
		const capped = step(progress, T0 + NEW_WORDS_PER_DAY);
		assert.equal(capped, progress);
		assert.deepEqual(pickNext(words, progress, T0 + NEW_WORDS_PER_DAY, DAY), { kind: "rest" });
	});

	it("resets the cap on the next day", () => {
		let progress = emptyProgress;
		for (let i = 0; i < NEW_WORDS_PER_DAY; i += 1) {
			progress = step(progress, T0 + i);
		}
		const tomorrow = dayKeyOf(new Date(2025, 0, 11));
		const firstLearning = progress.cards.get(words[0]?.id ?? wordId(""));
		assert.equal(firstLearning?.kind, "learning");
		const reviewed = Array.from({ length: NEW_WORDS_PER_DAY }).reduce<Progress>(
			(acc, _unused, i) => step(acc, T0 + INTERVALS_MS[0] + i, DAY),
			progress,
		);
		const next = pickNext(words, reviewed, T0 + 2 * INTERVALS_MS[1], tomorrow);
		assert.equal(next.kind, "review");
		const afterReviews = Array.from({ length: NEW_WORDS_PER_DAY }).reduce<Progress>(
			(acc, _unused, i) => step(acc, T0 + 2 * INTERVALS_MS[1] + i, tomorrow),
			reviewed,
		);
		assert.deepEqual(pickNext(words, afterReviews, T0 + 2 * INTERVALS_MS[1] + 10, tomorrow).kind, "new");
	});

	it("brings a due word back before any new word, most overdue first", () => {
		const progress = step(step(emptyProgress, T0), T0 + 1);
		const pick = pickNext(words, progress, T0 + INTERVALS_MS[0] + 1, DAY);
		assert.equal(pick.kind, "review");
		assert.equal(pick.kind === "review" ? pick.word.id : undefined, words[0]?.id);
	});

	it("retires a word as learned after the full schedule", () => {
		const single = words.slice(0, 1);
		let progress = expose(emptyProgress, pickNext(single, emptyProgress, T0, DAY), T0, DAY);
		let now = T0;
		for (const interval of INTERVALS_MS) {
			now += interval;
			progress = expose(progress, pickNext(single, progress, now, DAY), now, DAY);
		}
		assert.deepEqual(progress.cards.get(wordId("um")), { kind: "retired", reason: "learned" });
		assert.deepEqual(pickNext(single, progress, now + 365 * INTERVALS_MS[1], DAY), { kind: "rest" });
	});

	it("skip retires the current word and frees its daily slot", () => {
		const progress = skipCurrent(step(emptyProgress, T0));
		assert.equal(progress.current, undefined);
		assert.deepEqual(progress.cards.get(wordId("um")), { kind: "retired", reason: "skipped" });
		assert.equal(statsOf(words, progress, DAY).newToday, 0);
		assert.equal(skipCurrent(progress), progress);
	});

	it("ignores cards for words removed from the curriculum", () => {
		const cards = new Map(emptyProgress.cards);
		cards.set(wordId("removed"), { kind: "learning", seen: 1, dueAtMs: 0, introducedOn: DAY });
		const pick = pickNext(words, { ...emptyProgress, cards }, T0, DAY);
		assert.equal(pick.kind, "new");
	});
});

describe("progress file", () => {
	it("round-trips", () => {
		const progress = step(step(emptyProgress, T0), T0 + 1);
		assert.deepEqual(roundTrip(progress), progress);
		assert.deepEqual(roundTrip({ ...emptyProgress, display: "off" }), { ...emptyProgress, display: "off" });
	});

	const invalid: ReadonlyArray<readonly [string, unknown]> = [
		["null", null],
		["array", []],
		["future version", { version: 2, display: "on", cards: {} }],
		["bad display", { version: 1, display: "maybe", cards: {} }],
		["cards not object", { version: 1, display: "on", cards: [] }],
		["seen out of range", { version: 1, display: "on", cards: { um: { kind: "learning", seen: 6, dueAtMs: 0, introducedOn: "2025-01-10" } } }],
		["bad day", { version: 1, display: "on", cards: { um: { kind: "learning", seen: 1, dueAtMs: 0, introducedOn: "yesterday" } } }],
		["NaN due", { version: 1, display: "on", cards: { um: { kind: "learning", seen: 1, dueAtMs: Number.NaN, introducedOn: "2025-01-10" } } }],
		["bad retire reason", { version: 1, display: "on", cards: { um: { kind: "retired", reason: "bored" } } }],
		["current not string", { version: 1, display: "on", cards: {}, current: 3 }],
	];
	for (const [name, raw] of invalid) {
		it(`rejects ${name}`, () => {
			assert.equal(parseProgress(raw).ok, false);
		});
	}
});
