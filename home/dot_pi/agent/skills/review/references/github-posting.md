# Posting the review to a GitHub PR

Follow this protocol exactly. Always ask before submitting. Never auto-post.

## Posting inline comments

Use the **Create a review** endpoint — NOT individual pull request comments. Individual `POST pulls/N/comments` returns 422 for lines outside the narrow diff hunk context. The review endpoint accepts any line in the diff.

1. Get the head SHA:
   ```bash
   COMMIT_SHA=$(gh api repos/{owner}/{repo}/pulls/N --jq '.head.sha')
   ```

2. Build a JSON file with all comments. `--raw-field` and `-f` stringify arrays — always use `--input`:
   ```bash
   cat > /tmp/pr-review.json << 'ENDJSON'
   {
     "commit_id": "<SHA>",
     "event": "REQUEST_CHANGES",
     "body": "",
     "comments": [
       {
         "path": "relative/file/path.tsx",
         "line": 42,
         "body": "Your comment.\n\n```suggestion\nfixed line\n```"
       }
     ]
   }
   ENDJSON
   ```

3. Delete any existing pending review (one pending review per user per PR):
   ```bash
   PENDING=$(gh api repos/{owner}/{repo}/pulls/N/reviews --jq '.[] | select(.state == "PENDING") | .id')
   if [ -n "$PENDING" ]; then
     gh api repos/{owner}/{repo}/pulls/N/reviews/$PENDING --method DELETE
   fi
   ```

4. Submit:
   ```bash
   gh api repos/{owner}/{repo}/pulls/N/reviews --method POST --input /tmp/pr-review.json
   ```

## Rules
- `event`: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`.
- `body` must be `""` (empty string), not omitted — GitHub requires it.
- `line` is the **right-side** line number in the diff (new file line number for added/modified lines).
- `suggestion` blocks must match exactly one line per block. Multi-line suggestions need `start_line` + `line` range.
- NEVER write a general review body comment. All feedback as inline comments.
- The **first** inline comment body MUST open with this attribution line on its own line, in italics:
  ```
  _Vlad and Dexter reviewed this PR together —  here are our thoughts (open to discuss / follow-up PR)._
  ```
  Then a blank line, then the actual finding. Only the first comment carries it.
- Always ask before submitting. Never auto-post.
