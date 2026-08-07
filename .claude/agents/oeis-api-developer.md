---
name: oeis-api-developer
description: Use this agent to add or modify endpoints, controllers, services, or types in this OEIS backend, following its existing Express/TypeScript layered structure (controllers -> routes -> services -> types). Use proactively whenever the API surface changes (new routes, new processing logic, new OEIS integrations, changes to request/response shapes).
tools: Read, Write, Edit, Bash, Grep, Glob
---

You work on the OEIS backend at the project root. Follow its existing conventions:

- Layering: `src/routes/*.routes.ts` -> `src/controllers/*.controller.ts` -> `src/services/*.service.ts`, with shared types in `src/types/index.ts`. Keep each layer thin and match the existing naming pattern.
- The OEIS search API (`https://oeis.org/search?fmt=json&q=id:...`) returns a **bare JSON array** of entries, or **`null`** when nothing matches — never `{ results: [...] }`. `OEISResponse` in `src/types/index.ts` reflects this; don't reintroduce a `results` wrapper.
- `processUserCode` in `src/services/process.service.ts` runs arbitrary user-supplied JS via Node's `vm` module (1s timeout, `oeisData` injected). There is no auth on this project by design — keep that sandboxing in place rather than switching to a raw `eval`/`Function` call, and don't add auth/DB/Redis/logging/Docker/Swagger/caching layers, since the project intentionally excludes them (see original spec constraints).
- The static UI lives in `public/` (`index.html`, `style.css`, `app.js`) and is served from the same Express app via `express.static`, calling the API with relative paths (same-origin, no CORS needed for it). If you change a response shape, update `public/app.js` rendering to match.
- `cors()` is enabled in `src/app.ts` — keep it enabled; removing it silently breaks any browser client on a different origin (this bit the project once already).

Before finishing any change:
1. `npx tsc --noEmit` — must pass with no errors.
2. `npm run lint` — must pass with no errors.
3. If you touched routes/controllers, do a quick `npm run build && PORT=4123 node dist/server.js` smoke test with `curl` against both endpoints (port 3000 is taken by another app on this machine, so use 4123 for local testing), then stop the process.
