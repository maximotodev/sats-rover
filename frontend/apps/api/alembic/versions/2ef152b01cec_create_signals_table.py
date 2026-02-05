"""create_signals_table

Revision ID: 2ef152b01cec
Revises: 0001_create_places
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2ef152b01cec'
down_revision = '0001_create_places'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Signals Table (Kind 30331)
    op.create_table(
        "signals",
        sa.Column("event_id", sa.String(64), primary_key=True),
        sa.Column("pubkey", sa.String(64), nullable=False),
        sa.Column("place_id", sa.String(128), sa.ForeignKey("places.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        # ✅ NEW: Explicit date column for Sybil resistance
        sa.Column("signal_date", sa.Date(), nullable=False), 
    )
    
    # 2. Sybil Resistance: One signal per human per merchant per day
    # This index is now IMMUTABLE and lightning fast.
    op.create_unique_constraint(
        "ux_signals_pubkey_place_date",
        "signals",
        ["pubkey", "place_id", "signal_date"]
    )

    # 3. Merchant Claims Table (Kind 30333)
    op.create_table(
        "merchant_claims",
        sa.Column("place_id", sa.String(128), primary_key=True),
        sa.Column("pubkey", sa.String(64), nullable=False),
        sa.Column("event_id", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_claims_pubkey", "merchant_claims", ["pubkey"])

def downgrade():
    op.drop_table("merchant_claims")
    op.drop_table("signals")