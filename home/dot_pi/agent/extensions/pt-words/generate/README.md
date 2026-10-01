# pt-words curriculum build

Rebuilds `../words.ts`. Not deployed by chezmoi.

```nu
mkdir /tmp/ptgen
http get https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt/pt_50k.txt | save -f /tmp/ptgen/pt_50k.txt
^curl -fsSL -o /tmp/ptgen/pt.jsonl https://kaikki.org/dictionary/Portuguese/kaikki.org-dictionary-Portuguese.jsonl
node extract.ts /tmp/ptgen/pt_50k.txt /tmp/ptgen/pt.jsonl /tmp/ptgen/candidates.json 2300
# translate: candidates → /tmp/ptgen/uk.tsv (`pt<TAB>uk`, `-` = drop), done by an LLM agent
node emit.ts /tmp/ptgen/candidates.json /tmp/ptgen/uk.tsv /tmp/ptgen/pt.jsonl 2000
node --test ipa.test.ts ../core.test.ts
```

Progress in `~/.pi/agent/pt-words.json` is keyed by the Portuguese word, so a rebuild keeps it.
