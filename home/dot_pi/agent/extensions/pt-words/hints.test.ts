import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hintOf } from "./hints.ts";
import { WORDS } from "./words.ts";

const hintFor = (pt: string): string | undefined => {
	const word = WORDS.find((candidate) => candidate.id === pt);
	assert.ok(word, `${pt} is not in the curriculum`);
	return hintOf(word);
};

describe("hintOf", () => {
	const cases: ReadonlyArray<readonly [string, string | undefined]> = [
		["sim", "(н) — через ніс, язик не торкається піднебіння"],
		["carro", "r/rr тут — горлове р, як французьке"],
		["filho", "lh — мʼяке ль, як у «льон»"],
		["adeus", "s перед приголосним і в кінці — ш"],
		["fixe", "кінцеве e майже не чути"],
		["obrigado", "кінцеве o звучить як у"],
		["olá", undefined],
	];
	for (const [pt, expected] of cases) {
		it(pt, () => {
			assert.equal(hintFor(pt), expected);
		});
	}

	it("nasal wins over other rules", () => {
		assert.equal(hintFor("não"), "(н) — через ніс, язик не торкається піднебіння");
	});
});
