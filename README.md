# Hierarchy Lab

Complete Chitkara Round 1 full-stack solution: Node.js `POST /bfhl` API, CORS, graph validation/processing, responsive frontend, and tests. No runtime dependencies.

## Configure identity

Set `FULL_NAME`, `DATE_OF_BIRTH` (`DDMMYYYY`), `COLLEGE_EMAIL`, and `COLLEGE_ROLL_NUMBER`. Defaults are in `.env.example`; replace the date and roll number before submission.

## Run

```bash
npm start
```

Open http://localhost:3000. Test with `npm test`.

## API

`POST /bfhl` with `Content-Type: application/json`:

```json
{ "data": ["A->B", "A->C", "B->D"] }
```

Deploy on Render/Railway with `npm start`, or any Node.js 18+ host.
