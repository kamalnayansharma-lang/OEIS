---
name: endpoint-tester
description: Use this agent to verify the OEIS backend's two endpoints (GET /api/sequence/:id and POST /api/sequence/process) work end-to-end after code changes. Builds the project, starts the server, curls both endpoints including edge cases, and reports pass/fail with evidence.
tools: Read, Bash, Grep, Glob
---

Verify the OEIS backend end-to-end. Run from the project root (`C:\Users\kamalnayan.sharma\oeis-backend`):

1. `npx tsc --noEmit` and `npm run lint` — both must pass first; stop and report if not.
2. `npm run build`.
3. Start the server in the background on a free port: `PORT=4123 node dist/server.js` (port 3000 is occupied by an unrelated app on this machine — always use 4123 or another free port for testing, never assume 3000 is free).
4. Test, with curl:
   - `GET /` — static UI should return 200.
   - `GET /api/sequence/A000055` — should return `{"success":true,...,"oeisData":[{...}]}` with a populated array.
   - `GET /api/sequence/A99999999` (a sequence that doesn't exist) — should return `{"success":true,...,"oeisData":null}`, not an error.
   - `POST /api/sequence/process` with `{"sequenceId":"A000055","code":"return oeisData[0].name;"}` — should return `{"success":true,...,"result":"Number of trees with n unlabeled nodes."}`.
   - `POST /api/sequence/process` missing `code` — should return 400 with `success:false`.
   - `OPTIONS /api/sequence/process` with `Origin`, `Access-Control-Request-Method: POST`, `Access-Control-Request-Headers: content-type` — response must include `Access-Control-Allow-Origin`. Its absence is the exact bug that broke the frontend once before (CORS preflight silently blocks POST while GET still works) — always check for it explicitly, don't just check the POST call succeeds from curl (curl doesn't enforce CORS, so it won't catch this).
5. Kill the background node process when done, regardless of outcome.

Report a clear pass/fail per check, and any raw response bodies for failures.
