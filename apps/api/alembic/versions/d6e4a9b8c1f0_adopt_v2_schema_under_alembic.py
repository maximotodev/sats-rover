"""adopt_v2_schema_under_alembic

Revision ID: d6e4a9b8c1f0
Revises: f1a7c9d2e4b6
Create Date: 2026-03-29
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "d6e4a9b8c1f0"
down_revision = "f1a7c9d2e4b6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS signals_v2_events (
          event_id TEXT PRIMARY KEY,
          pubkey TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          place_id TEXT NOT NULL,
          status TEXT NOT NULL,
          day_utc INTEGER NOT NULL,
          g TEXT NULL,
          client TEXT NULL,
          amount_msat BIGINT NULL,
          zap TEXT NULL,
          bolt11 TEXT NULL,
          content TEXT NOT NULL,
          raw_event JSONB NULL,
          payment_evidence JSONB NULL,
          relay TEXT NULL,
          inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        ALTER TABLE signals_v2_events
          ADD COLUMN IF NOT EXISTS raw_event JSONB NULL,
          ADD COLUMN IF NOT EXISTS payment_evidence JSONB NULL,
          ADD COLUMN IF NOT EXISTS relay TEXT NULL,
          ADD COLUMN IF NOT EXISTS inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'signals_v2_events'::regclass
              AND contype = 'p'
          ) THEN
            ALTER TABLE signals_v2_events
              ADD CONSTRAINT signals_v2_events_pkey PRIMARY KEY (event_id);
          END IF;
        END $$;
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS signals_v2_state (
          pubkey TEXT NOT NULL,
          place_id TEXT NOT NULL,
          day_utc INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          event_id TEXT NOT NULL,
          g TEXT NULL,
          client TEXT NULL,
          amount_msat BIGINT NULL,
          zap TEXT NULL,
          bolt11 TEXT NULL,
          content TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (pubkey, place_id, day_utc)
        )
        """
    )
    op.execute(
        """
        ALTER TABLE signals_v2_state
          ADD COLUMN IF NOT EXISTS g TEXT NULL,
          ADD COLUMN IF NOT EXISTS client TEXT NULL,
          ADD COLUMN IF NOT EXISTS amount_msat BIGINT NULL,
          ADD COLUMN IF NOT EXISTS zap TEXT NULL,
          ADD COLUMN IF NOT EXISTS bolt11 TEXT NULL,
          ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'signals_v2_state'::regclass
              AND contype = 'p'
          ) THEN
            ALTER TABLE signals_v2_state
              ADD CONSTRAINT signals_v2_state_pkey PRIMARY KEY (pubkey, place_id, day_utc);
          END IF;
        END $$;
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS app_state_claims (
          pubkey TEXT NOT NULL,
          d TEXT NOT NULL,
          place_id TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          event_id TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (pubkey, d)
        )
        """
    )
    op.execute(
        """
        ALTER TABLE app_state_claims
          ADD COLUMN IF NOT EXISTS place_id TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner',
          ADD COLUMN IF NOT EXISTS created_at BIGINT NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS event_id TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'app_state_claims'::regclass
              AND contype = 'p'
          ) THEN
            ALTER TABLE app_state_claims
              ADD CONSTRAINT app_state_claims_pkey PRIMARY KEY (pubkey, d);
          END IF;
        END $$;
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS ingestion_state (
          key TEXT PRIMARY KEY,
          value BIGINT NULL,
          value_json JSONB NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        ALTER TABLE ingestion_state
          ADD COLUMN IF NOT EXISTS value_json JSONB NULL
        """
    )
    op.execute(
        """
        ALTER TABLE ingestion_state
          ADD COLUMN IF NOT EXISTS value BIGINT NULL
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'ingestion_state'
              AND column_name = 'value'
              AND udt_name <> 'int8'
          ) THEN
            IF EXISTS (
              SELECT 1
              FROM ingestion_state
              WHERE value IS NOT NULL
                AND btrim(value::text) <> ''
                AND btrim(value::text) !~ '^[0-9]+$'
            ) THEN
              RAISE EXCEPTION
                'ingestion_state.value contains non-numeric legacy data; normalize manually before running schema ownership migration';
            END IF;

            ALTER TABLE ingestion_state
              ALTER COLUMN value DROP NOT NULL,
              ALTER COLUMN value TYPE BIGINT
              USING NULLIF(btrim(value::text), '')::bigint;
          END IF;
        END $$;
        """
    )
    op.execute(
        """
        ALTER TABLE ingestion_state
          ALTER COLUMN updated_at SET DEFAULT now()
        """
    )

    with op.get_context().autocommit_block():
        op.execute(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS signals_v2_events_dup_lookup_idx
            ON signals_v2_events (pubkey, place_id, day_utc, created_at DESC, event_id DESC)
            """
        )


def downgrade() -> None:
    raise RuntimeError(
        "Unsupported downgrade: d6e4a9b8c1f0 adopts live runtime-used v2 schema under Alembic ownership and must not drop load-bearing tables."
    )
