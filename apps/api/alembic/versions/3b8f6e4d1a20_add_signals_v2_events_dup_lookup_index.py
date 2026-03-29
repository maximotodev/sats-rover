"""add_signals_v2_events_dup_lookup_index

Revision ID: 3b8f6e4d1a20
Revises: 8d4f9c0a1b2e
Create Date: 2026-03-05
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3b8f6e4d1a20"
down_revision = "8d4f9c0a1b2e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    table_exists = bool(
        bind.execute(
            sa.text(
                """
                SELECT to_regclass(current_schema() || '.signals_v2_events') IS NOT NULL
                """
            )
        ).scalar()
    )
    if not table_exists:
        return

    with op.get_context().autocommit_block():
        op.execute(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS signals_v2_events_dup_lookup_idx
            ON signals_v2_events (pubkey, place_id, day_utc, created_at DESC, event_id DESC)
            """
        )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute(
            """
            DROP INDEX CONCURRENTLY IF EXISTS signals_v2_events_dup_lookup_idx
            """
        )
