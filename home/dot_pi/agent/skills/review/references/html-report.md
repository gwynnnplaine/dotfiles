# HTML report

The full review is delivered as a self-contained HTML file. Fill the fixed skeleton below — do NOT redesign it, restyle it, or add sections. Stable layout across runs is the point.

## Rules

- Path: `/tmp/pi-review-<target>.html` — `<target>` is `pr-3281`, `staged`, or the ref slug. Re-runs on the same target overwrite the file.
- Write the file with the write tool, then open it: `open /tmp/pi-review-<target>.html`.
- Escape `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;` inside every `<pre>`/`<code>` — TSX code will break the page otherwise.
- Findings keep the [finding-style.md](finding-style.md) voice verbatim — the question, the why, the severity word. The HTML is a renderer, not a rewrite pass.
- Delete empty severity groups. Delete the whole Type design section for non-TS diffs.
- The worksheet renders as the `.ws` table — one `<tr>` per worksheet row, topic in `.topic`, status in `.st` (`st-holds` / `st-violated` / `st-na`), evidence in `.ev`. The content must match the `type-review` derivation verbatim; only the layout is a table. The `score = …` line stays a single `.score` div below the table. Keep the `<colgroup>` — it pins the layout so code blocks scroll inside their cell instead of stretching the page.
- **Path to 5** follows the score — an ordered list derived mechanically, never generic advice: one item per VIOLATED row (its could-be sketch, citing the finding, naming what it lifts — e.g. `lifts cap 2`), one item per unresolved Blocker/Should Fix finding, then the remaining band requirements (six-month **lasts** → 4, deletion test → 5). Every item traces to a worksheet row, a finding, or a band rule. If the score is already 5, omit the section.
- **Evidence is quoted code, not prose.** A VIOLATED row shows the contradiction as labelled code blocks with `file:line`: `.evlabel` "types permit" over the type/parser that admits the value, `.evlabel` "runtime forbids" over the guard/filter/redirect that rejects it, and ALWAYS a closing `.evlabel good` "could be" over the fix sketch from the cited finding — the row must end with the recipe, not the diagnosis. A comment-probe row quotes the comment under `.evlabel` "the hope", then its "could be" (the type that replaces the comment). A holds row quotes the enforcing type under `.evlabel` "proof". Only n/a rows may be prose-only. One sentence of prose above the blocks ties them together and cites the finding number.
- One `.finding` card per finding: question in `.q`, why + aside in `.why`, exact location in `.loc`. Add the `.cmp` block only when the finding has a now/could-be comparison; `why it lasts` goes in `.lasts`.
- Event badge class: `REQUEST_CHANGES` → `badge-rc`, `COMMENT` → `badge-comment`.

## Skeleton

Replace `{{...}}` placeholders; repeat the marked blocks per item.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>review — {{TARGET}}</title>
<style>
  :root {
    --bg:#16181d; --panel:#1e2128; --border:#2c313a; --fg:#d7dae0; --dim:#9aa0a6;
    --blocker:#ff5c57; --shouldfix:#f3a33c; --simplification:#57c7ff;
    --nit:#9aa0a6; --question:#c792ea; --ok:#5af78e;
    --mono:ui-monospace,"JetBrains Mono","SF Mono",Menlo,monospace;
  }
  *{box-sizing:border-box}
  body{margin:0 auto;max-width:1080px;padding:40px 28px 80px;background:var(--bg);color:var(--fg);
       font:17px/1.6 -apple-system,"Segoe UI",sans-serif}
  h1{font-size:25px;margin:0 0 6px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);
     margin:48px 0 16px;border-bottom:1px solid var(--border);padding-bottom:8px}
  .meta{color:var(--dim);font-size:15px}
  .meta code{color:var(--fg)}
  code,pre{font-family:var(--mono);font-size:15px}
  code{background:var(--panel);border:1px solid var(--border);border-radius:4px;padding:1px 5px}
  pre{background:var(--panel);border:1px solid var(--border);border-radius:8px;
      padding:14px 16px;overflow-x:auto;line-height:1.5;margin:10px 0 0}
  pre code{background:none;border:0;padding:0}
  .badge{display:inline-block;font:700 13px/1 var(--mono);text-transform:uppercase;
         letter-spacing:.08em;padding:6px 10px;border-radius:4px;color:#16181d;vertical-align:3px}
  .badge-rc{background:var(--blocker)} .badge-comment{background:var(--simplification)}
  .sevtag{font:700 12px/1 var(--mono);text-transform:uppercase;letter-spacing:.08em;
          color:var(--sev);margin-bottom:8px}
  .finding{background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--sev,var(--dim));
           border-radius:8px;padding:16px 18px;margin:12px 0}
  .sev-blocker{--sev:var(--blocker)} .sev-shouldfix{--sev:var(--shouldfix)}
  .sev-simplification{--sev:var(--simplification)} .sev-nit{--sev:var(--nit)}
  .sev-question{--sev:var(--question)}
  .q{font-weight:600;margin:0 0 6px}
  .why{margin:0 0 8px;color:var(--fg)}
  .loc{font-family:var(--mono);font-size:13px;color:var(--dim)}
  .label{font:700 12px var(--mono);text-transform:uppercase;letter-spacing:.08em;
         color:var(--dim);margin:12px 0 0}
  .lasts{margin:10px 0 0;font-size:15px;color:var(--dim)}
  .lasts b{color:var(--ok)}
  .ws{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;margin:10px 0 0;
      background:var(--panel);border:1px solid var(--border);border-radius:8px;overflow:hidden}
  .c-topic{width:230px} .c-st{width:150px}
  .ws td{padding:12px 16px;border-top:1px solid var(--border);vertical-align:top;font-size:15px}
  .ws tr:first-child td{border-top:0}
  .ws .topic{font-family:var(--mono);font-size:14px;color:var(--dim)}
  .ws .st{font:700 12px var(--mono);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
  .st-holds{color:var(--ok)} .st-violated{color:var(--blocker)} .st-na{color:var(--dim)}
  .ws .ev{color:var(--fg);width:100%}
  .ev p{margin:0}
  .evlabel{font:700 12px var(--mono);text-transform:uppercase;letter-spacing:.06em;
           color:var(--dim);margin:12px 0 0}
  .evlabel.good{color:var(--ok)}
  .ev pre{margin:4px 0 0;padding:10px 12px;font-size:14px}
  .ev .loc{margin-top:4px}
  .score{font:700 28px var(--mono);margin-top:16px}
  .score .fast{color:var(--shouldfix)} .score .lasts-label{color:var(--ok)}
  .path{margin:10px 0 0;padding-left:24px}
  .path li{margin:10px 0}
  .path .lift{font:700 12px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--ok)}
  footer{margin-top:56px;color:var(--dim);font-size:13px}
</style>
</head>
<body>

<header>
  <h1>{{PR_OR_TARGET_TITLE}} <span class="badge {{BADGE_CLASS}}">{{EVENT}}</span></h1>
  <div class="meta">{{REPO}} · <code>{{BASE}}...{{HEAD}}</code> · {{N_FILES}} files · +{{ADD}}/−{{DEL}} · {{DATE}}</div>
</header>

<h2>Flow map</h2>
<pre>{{FLOW_MAP_ASCII}}</pre>

<h2>Findings</h2>
<!-- repeat per finding; class matches severity -->
<div class="finding sev-shouldfix">
  <div class="sevtag">should fix</div>
  <p class="q">{{QUESTION}}</p>
  <p class="why">{{WHY_AND_ASIDE}}</p>
  <div class="loc">{{FILE}}:{{LINE}}</div>
  <!-- only when the finding has a now/could-be comparison -->
  <div class="label">now</div>
  <pre><code>{{NOW_CODE}}</code></pre>
  <div class="label">could be</div>
  <pre><code>{{COULD_BE_CODE}}</code></pre>
  <p class="lasts"><b>why it lasts</b> — {{WHY_IT_LASTS}}</p>
</div>
<!-- /repeat -->

<h2>Type design</h2>
<table class="ws">
  <colgroup><col class="c-topic"><col class="c-st"><col></colgroup>
  <!-- repeat per worksheet row; VIOLATED example -->
  <tr>
    <td class="topic">{{TOPIC}}</td>
    <td class="st st-violated">{{VIOLATED → cap 2}}</td>
    <td class="ev">
      <p>{{ONE_SENTENCE — the named value + finding #N}}</p>
      <div class="evlabel">types permit</div>
      <pre><code>{{PERMITTING_TYPE_OR_PARSER}}</code></pre>
      <div class="loc">{{FILE}}:{{LINE}}</div>
      <div class="evlabel">runtime forbids</div>
      <pre><code>{{FORBIDDING_GUARD_OR_FILTER}}</code></pre>
      <div class="loc">{{FILE}}:{{LINE}}</div>
      <div class="evlabel good">could be</div>
      <pre><code>{{FIX_SKETCH_FROM_CITED_FINDING}}</code></pre>
    </td>
  </tr>
  <!-- holds example: one "proof" block; n/a: prose only -->
  <tr>
    <td class="topic">{{TOPIC}}</td>
    <td class="st st-holds">holds</td>
    <td class="ev">
      <p>{{ONE_SENTENCE}}</p>
      <div class="evlabel">proof</div>
      <pre><code>{{ENFORCING_TYPE}}</code></pre>
      <div class="loc">{{FILE}}:{{LINE}}</div>
    </td>
  </tr>
  <!-- /repeat -->
</table>
<div class="score">score = min(band, caps) = {{SCORE}}/5 <span class="{{fast|lasts-label}}">{{LABEL}}</span></div>

<h2>Path to 5</h2>
<ol class="path">
  <!-- repeat: VIOLATED rows first, then open findings, then band requirements -->
  <li>{{FIX_FROM_COULD_BE}} (finding #{{N}}) <span class="lift">→ {{lifts cap 2 | label → lasts → 4 | deletion test → 5}}</span></li>
  <!-- /repeat -->
</ol>

<footer>generated by /review · {{TARGET}} · {{TIMESTAMP}}</footer>

</body>
</html>
```
