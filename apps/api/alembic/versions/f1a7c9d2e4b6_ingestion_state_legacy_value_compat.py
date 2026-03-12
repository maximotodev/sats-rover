"""ingestion_state_legacy_value_compat

Revision ID: f1a7c9d2e4b6
Revises: c3e9b2f4a1d0
Create Date: 2026-03-06
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "f1a7c9d2e4b6"
down_revision = "c3e9b2f4a1d0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS ingestion_state (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        ALTER TABLE ingestion_state
        ADD COLUMN IF NOT EXISTS value TEXT NULL
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE ingestion_state
        DROP COLUMN IF EXISTS value
        """
    )
