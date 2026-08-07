---
name: issue-implement
description: Given a GitHub issue, implement it end-to-end without asking for clarification — production code, tests, lint/type/test fixes, a senior-engineer pre-review pass, and a ready-to-merge PR. Use when asked to implement, build out, or ship a ticket/issue fully.
---

# issue-implement

Given a GitHub issue: (1) analyze it for requirements, constraints, and impacted components; (2) implement production-ready code following this repo's existing patterns and architecture; (3) add/update unit, integration, and regression tests; (4) run and fix all lint, format, type-check, and test failures — must pass, including the 100% coverage threshold in `jest.config.js`; (5) do a pre-review as a senior engineer, flagging only critical/blocking issues, not nitpicks; (6) fix every critical issue found; (7) re-verify implementation, tests, lint, security, and build all pass together, not just individually; (8) write commit message(s) matching this repo's existing conventions; (9) write a PR description with Summary, Changes, Testing, Risks, Rollback; (10) per the branch-protection policy, do all of this on a new feature branch and push it — never commit to `main` directly, and never merge without the user's go-ahead.

Do not ask for clarification along the way — make reasonable, explicitly documented assumptions and keep moving. If a requirement is genuinely ambiguous enough that a wrong guess would mean redoing the implementation, state the assumption made and proceed rather than blocking.

Output only: Implementation Summary, Files Changed, Test Results, Critical Review Findings (if any), Commit Message, Ready-to-Merge PR Description.

Definition of Done: code complete, tests written and passing, lint clean, critical review issues resolved, PR pushed and ready for merge.
