import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ipaToCyrillic } from "./ipa.ts";

const say = (ipa: string): string => {
	const result = ipaToCyrillic(ipa);
	assert.ok(result.ok, result.ok ? "" : `unknown ${result.unknown} in ${ipa}`);
	return result.say;
};

describe("ipaToCyrillic", () => {
	const cases: ReadonlyArray<readonly [string, string, string]> = [
		["fixe", "/ˈfi.ʃɨ/", "фіш"],
		["comboio", "/kõˈbɔj.u/", "ко(н)бо́ю"],
		["obrigado", "/o.bɾiˈɣa.du/", "обріґа́ду"],
		["não", "/ˈnɐ̃w̃/", "нау(н)"],
		["mãe", "/ˈmɐ̃j̃/", "май(н)"],
		["filho", "/ˈfi.ʎu/", "фі́лю"],
		["amanhã", "/a.mɐˈɲɐ̃/", "аманя́(н)"],
		["família", "/fɐˈmi.ljɐ/", "фамі́л'я"],
		["estar", "/ɨʃˈtaɾ/", "ишта́р"],
		["sim", "/ˈsĩ/", "сі(н)"],
	];
	for (const [word, ipa, expected] of cases) {
		it(word, () => {
			assert.equal(say(ipa), expected);
		});
	}

	it("drops optional sounds and brackets", () => {
		assert.equal(say("[ˈma(ɾ)]"), "ма");
	});

	it("takes the first of several alternatives", () => {
		assert.equal(say("/ˈno(w).tɾu | ˈnoj.tɾu/"), "но́тру");
	});

	it("reports unknown symbols instead of guessing", () => {
		assert.deepEqual(ipaToCyrillic("/ˈqa/"), { ok: false, unknown: "q" });
	});
});
