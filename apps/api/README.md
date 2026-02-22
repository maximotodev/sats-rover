# API Service

## Environment

Required environment variables:

- `DATABASE_URL`
- `REDIS_URL`

For local development, `apps/api/.env` is loaded automatically by `app.core.settings.Settings` (`env_file=".env"`).
Environment variables set in the shell still override values from `.env`.

## Run Locally

```bash
cd apps/api && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000
```
