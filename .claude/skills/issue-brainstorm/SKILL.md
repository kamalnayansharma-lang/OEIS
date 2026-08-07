---
name: issue-brainstorm
description: Run a Matt-Pocock-style brainstorm on a problem statement via mattpocock-skills:grilling, write up the resolved decisions, convert to a GitHub issue, and publish it. Use when asked to brainstorm an idea and turn it into a tracked ticket.
---

# issue-brainstorm

Require a problem statement; if missing, ask — never guess the topic of a whole ticket.

**Phase 1 — invoke the real skill:** call Skill `mattpocock-skills:grilling` with the problem statement as `args` (verified unlocked — no `disable-model-invocation`, unlike `improve-codebase-architecture`, which must never be wrapped). Follow its rounds-of-frontier-questions process, dispatching sub-agents for facts, until the frontier is empty and the user confirms shared understanding.

**Phase 1.5 — write-up:** synthesize the resolved decisions into Problem Understanding, User Stories, 5+ Brainstormed Solutions (pros/cons/risks/complexity, grounded in real files and this repo's no-auth/no-DB/no-Redis/no-Docker/no-Swagger constraints), Edge Cases, Technical Considerations, and a Recommendation with its tradeoff named. Show it to the user before Phase 2 unless told to skip ahead.

**Phase 2 — ticket:** convert the recommendation into an issue body with Background, Problem Statement, Proposed Solution, Scope (In/Out), Technical Design, Acceptance Criteria (checkboxes, include tests + docs), Edge Cases, Risks+mitigation, Testing Strategy, Definition of Done, Open Questions. Title: `[Feature] <short title>`.

**Phase 3 — publish:** SSH doesn't cover the Issues API and no token is stored — ask for a one-time classic PAT (`repo` scope) if `GITHUB_TOKEN` is unset, verify it via the `X-OAuth-Scopes` response header before use, then `POST /repos/kamalnayansharma-lang/OEIS/issues` with a `node -e`-built JSON body (never hand-escape markdown into a shell string). Report the response's `html_url`, then tell the user to revoke the token. If they'd rather paste it themselves, stop after Phase 2 and hand them the title/body for https://github.com/kamalnayansharma-lang/OEIS/issues/new instead.
