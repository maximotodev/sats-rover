import os

os.environ.setdefault("database_url", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("redis_url", "redis://localhost:6379/0")
