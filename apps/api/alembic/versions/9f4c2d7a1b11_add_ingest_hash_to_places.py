"""add_ingest_hash_to_places

Revision ID: 9f4c2d7a1b11
Revises: 6c2f4b9d7e31
Create Date: 2026-03-05
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9f4c2d7a1b11"
down_revision = "6c2f4b9d7e31"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("places", sa.Column("ingest_hash", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("places", "ingest_hash")
