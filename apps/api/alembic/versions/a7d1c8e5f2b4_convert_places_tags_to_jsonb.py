"""convert_places_tags_to_jsonb

Revision ID: a7d1c8e5f2b4
Revises: 9f4c2d7a1b11
Create Date: 2026-03-05
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a7d1c8e5f2b4"
down_revision = "9f4c2d7a1b11"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE places
        ALTER COLUMN tags TYPE jsonb USING tags::jsonb,
        ALTER COLUMN tags SET DEFAULT '{}'::jsonb,
        ALTER COLUMN tags SET NOT NULL
        """
    )
    with op.get_context().autocommit_block():
        op.execute(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_places_tags_gin
            ON places USING GIN (tags)
            """
        )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS ix_places_tags_gin")
    op.execute(
        """
        ALTER TABLE places
        ALTER COLUMN tags TYPE json USING tags::json,
        ALTER COLUMN tags SET DEFAULT '{}'::json,
        ALTER COLUMN tags SET NOT NULL
        """
    )
