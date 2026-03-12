"""add_ingestion_state_table

Revision ID: c3e9b2f4a1d0
Revises: a7d1c8e5f2b4
Create Date: 2026-03-05
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "c3e9b2f4a1d0"
down_revision = "a7d1c8e5f2b4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS ingestion_state (
          key TEXT PRIMARY KEY,
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


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE ingestion_state
        DROP COLUMN IF EXISTS value_json
        """
    )
