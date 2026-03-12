"""add_raw_event_payment_evidence_to_signals_v2_events

Revision ID: 6c2f4b9d7e31
Revises: 3b8f6e4d1a20
Create Date: 2026-03-05
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "6c2f4b9d7e31"
down_revision = "3b8f6e4d1a20"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE IF EXISTS signals_v2_events
          ADD COLUMN IF NOT EXISTS raw_event JSONB NULL,
          ADD COLUMN IF NOT EXISTS payment_evidence JSONB NULL
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE IF EXISTS signals_v2_events
          DROP COLUMN IF EXISTS raw_event,
          DROP COLUMN IF EXISTS payment_evidence
        """
    )
