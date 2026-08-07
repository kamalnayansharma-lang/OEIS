---
name: dev-server
description: Start this OEIS backend's dev server and report a working URL. Use whenever asked to run, start, restart, or give a link/URL for this project (C:\Users\kamalnayan.sharma\oeis-backend).
---

# Starting the OEIS backend

Port 3000 is occupied by an unrelated app on this machine — never assume it's free. Always use port 4123 (or another explicitly-checked-free port) for local runs of this project.

Steps:

1. From the project root, stop any previous instance of this server if one is already running (check for a stray `node dist/server.js` from a prior run in this session before starting a new one — don't blindly kill all `node` processes on the machine, that can take down unrelated apps).
2. `npm run build`
3. Start it in the background: `PORT=4123 node dist/server.js`
4. Verify with `curl -s -o /dev/null -w "%{http_code}" http://localhost:4123/` — expect `200`.
5. Report the URL to the user: `http://localhost:4123/`
   - UI: `http://localhost:4123/`
   - GET endpoint: `http://localhost:4123/api/sequence/:id`
   - POST endpoint: `http://localhost:4123/api/sequence/process`

If port 4123 is also unexpectedly busy, pick another (e.g. 4124) and verify the same way before reporting a URL — never report a URL you haven't confirmed responds.
