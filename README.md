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

Frontend: http://localhost:5173

Backend API: http://127.0.0.1:8000/docs

The frontend includes local fallback data, so the product UI remains usable if the backend is not running.
