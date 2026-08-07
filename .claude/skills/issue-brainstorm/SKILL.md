---
name: issue-brainstorm
description: Run a structured, Matt-Pocock-style brainstorm on a problem statement, convert the recommendation into a fully-specced GitHub issue, and publish it to this repo's Issues tab. Use when the user wants to brainstorm a feature or problem and turn it directly into a tracked GitHub ticket (e.g. "brainstorm X and file an issue", "turn this idea into a ticket").
---

# issue-brainstorm

Takes a problem statement, runs it through a structured brainstorm, converts the recommendation into a GitHub issue body, and publishes it to `github.com/kamalnayansharma-lang/OEIS`.

If the user invoked this without a clear problem statement, ask them for one before proceeding — do not guess the topic of a whole ticket.

## Phase 1: Brainstorm

Adopt the brainstorming style of Matt Pocock:
- Think from a developer experience (DX) perspective first.
- Optimize for simplicity before flexibility.
- Challenge assumptions.
- Identify edge cases early.
- Prefer clear APIs over clever implementations.
- Think in terms of maintainability, scalability, and type safety.
- Surface hidden complexity.
- Explore multiple approaches before recommending one.
- Explicitly call out tradeoffs.

Given the problem statement, produce:

**Problem Understanding** — restate the problem, define the desired outcome, list assumptions (make reasonable assumptions and document them; don't ask for clarification unless the problem statement itself is missing).

**User Stories** — primary users, secondary users, key workflows.

**Brainstormed Solutions** — at least 5 options, each with: Name, Description, Pros, Cons, Risks, Technical complexity (Low/Medium/High). Ground these in the actual codebase (real file paths, real existing constraints from this project — no auth, no DB, no Redis, no Docker, no Swagger, no caching, no CI/CD were the original constraints, though CI/CD, tests, and lint have since been added; don't silently contradict a constraint that's still in force without flagging the tension explicitly).

**Edge Cases** — all major edge cases.

**Technical Considerations** — architecture, APIs, data flow, security, performance, monitoring, testing.

**Recommendation** — pick the best approach and justify it, explicitly naming the tradeoff being made.

Show this Phase 1 output to the user before moving to Phase 2, unless they've explicitly asked you to skip straight to filing the ticket.

## Phase 2: Convert to a GitHub ticket

Using the Phase 1 recommendation, produce a ticket body in this exact structure:

```markdown
## Background
Why this work is needed.

## Problem Statement
Clear description of the problem.

## Proposed Solution
Detailed implementation approach.

## Scope

### In Scope
- item

### Out of Scope
- item

## Technical Design
- Architecture overview
- Components impacted
- Dependencies

## Acceptance Criteria
- [ ] Requirement 1
- [ ] Tests added
- [ ] Documentation updated

## Edge Cases
- case

## Risks
- risk
- mitigation

## Testing Strategy
- Unit tests
- Integration tests
- E2E tests

## Definition of Done
- [ ] Code merged
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Monitoring added if required

## Open Questions
- question
```

Title format: `[Feature] <short title>`.

## Phase 3: Publish to GitHub

Creating an issue requires a GitHub API call — SSH access (used for `git push` in this repo) does **not** cover this, and there is no stored token. Never hardcode or commit a token.

1. Check if a `GITHUB_TOKEN` environment variable is already set (`echo $GITHUB_TOKEN` — don't print its value, just check it's non-empty). If not, ask the user to paste a Personal Access Token (classic, `repo` scope) for one-time use, the same way it's been done earlier in this project's history — never store it in a file.
2. Verify the token actually carries the `repo` scope before using it: `curl -sSI -H "Authorization: token $GH_TOKEN" https://api.github.com/repos/kamalnayansharma-lang/OEIS | grep -i x-oauth-scopes`. If `repo` isn't listed, tell the user the exact checkbox to check (the top-level `repo` box at https://github.com/settings/tokens/new) and ask for a new token — don't attempt the publish with an under-scoped token, since it fails opaquely.
3. Publish via the REST API, not `gh` (not installed on this machine):
   ```bash
   curl -sS -X POST \
     -H "Authorization: token $GH_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/kamalnayansharma-lang/OEIS/issues \
     -d "$(node -e 'console.log(JSON.stringify({title: process.argv[1], body: process.argv[2], labels: ["enhancement"]}))' "<title>" "<body>")"
   ```
   Build the JSON payload via `node -e` (as above) rather than hand-escaping the markdown body into a shell string — the ticket body contains backticks, quotes, and newlines that break naive shell escaping.
4. Report the created issue's URL (from the response's `html_url` field) back to the user.
5. Remind the user to revoke the token at https://github.com/settings/tokens once done, same as before.

If the user would rather paste the ticket into the GitHub UI themselves instead of granting API access, stop after Phase 2 and give them the title/body to paste at https://github.com/kamalnayansharma-lang/OEIS/issues/new — don't insist on the API path.
