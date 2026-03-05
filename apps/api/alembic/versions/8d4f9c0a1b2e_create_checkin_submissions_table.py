"""create_checkin_submissions_table

Revision ID: 8d4f9c0a1b2e
Revises: 2ef152b01cec
Create Date: 2026-02-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "8d4f9c0a1b2e"
down_revision = "2ef152b01cec"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "checkin_submissions",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("event_id", sa.Text(), nullable=False, unique=True),
        sa.Column("pubkey", sa.Text(), nullable=False),
        sa.Column("place_id", sa.String(length=128), sa.ForeignKey("places.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("reason_code", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("raw_event", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("payment_evidence", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.CheckConstraint(
            "status IN ('pending','confirmed','rejected')",
            name="ck_checkin_submissions_status",
        ),
    )


def downgrade() -> None:
    op.drop_table("checkin_submissions")
