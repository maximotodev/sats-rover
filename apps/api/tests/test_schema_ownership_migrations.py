from pathlib import Path


def test_historical_v2_index_migration_skips_missing_table_on_empty_db():
    migration = (
        Path(__file__).resolve().parents[1]
        / "alembic"
        / "versions"
        / "3b8f6e4d1a20_add_signals_v2_events_dup_lookup_index.py"
    )
    text = migration.read_text(encoding="utf-8")

    assert "to_regclass(current_schema() || '.signals_v2_events') IS NOT NULL" in text
    assert "if not table_exists:" in text
    assert "CREATE INDEX CONCURRENTLY IF NOT EXISTS signals_v2_events_dup_lookup_idx" in text


def test_head_schema_ownership_migration_adopts_v2_tables_and_ingestion_state_shape():
    migration = (
        Path(__file__).resolve().parents[1]
        / "alembic"
        / "versions"
        / "d6e4a9b8c1f0_adopt_v2_schema_under_alembic.py"
    )
    text = migration.read_text(encoding="utf-8")

    assert 'down_revision = "f1a7c9d2e4b6"' in text
    assert "CREATE TABLE IF NOT EXISTS signals_v2_events" in text
    assert "CREATE TABLE IF NOT EXISTS signals_v2_state" in text
    assert "CREATE TABLE IF NOT EXISTS app_state_claims" in text
    assert "CREATE TABLE IF NOT EXISTS ingestion_state" in text
    assert "ALTER COLUMN value TYPE BIGINT" in text
    assert "non-numeric legacy data" in text
    assert "CREATE INDEX CONCURRENTLY IF NOT EXISTS signals_v2_events_dup_lookup_idx" in text
