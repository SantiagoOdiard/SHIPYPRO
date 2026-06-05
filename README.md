# ShippyPro AI Logistics Copilot

A full-stack SaaS concept that turns shipment, carrier, return and cost data into operational intelligence for ecommerce logistics teams.

## Stack

- Frontend: React, Vite, TailwindCSS, React Router, Recharts
- Backend: FastAPI, JWT-ready auth flow, realistic demo analytics data
- Database target: PostgreSQL via `DATABASE_URL` for production wiring
- AI target: OpenAI via `OPENAI_API_KEY` for production assistant responses

## Run locally

```bash
npm --prefix frontend install
pip install -r backend/requirements.txt
```

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: (https://shipypro.vercel.app/)

The frontend includes local fallback data, so the product UI remains usable if the backend is not running.

## AI Assistant on Vercel

The `/assistant` page includes a Vercel serverless endpoint at `/api/assistant`.

To enable real OpenAI responses in production, add this environment variable in Vercel:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Optional:

```bash
OPENAI_MODEL=gpt-5.2
```

If `OPENAI_API_KEY` is not configured, the assistant keeps working with a local logistics demo fallback.
