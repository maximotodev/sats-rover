"""create places

Revision ID: 0001_create_places
Revises: 
Create Date: 2026-01-25
"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography


revision = "0001_create_places"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    op.create_table(
        "places",
        sa.Column("id", sa.String(length=128), primary_key=True),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),  # osm|btcmap|sr
        sa.Column("tags", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("location", Geography(geometry_type="POINT", srid=4326), nullable=False),
        sa.Column("glow_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("last_activity_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # PostGIS index for bbox queries
    op.create_index("ix_places_location_gist", "places", ["location"], postgresql_using="gist")

    # Common query indexes
    op.create_index("ix_places_source", "places", ["source"])
    op.create_index("ix_places_glow_score", "places", ["glow_score"])


def downgrade() -> None:
    op.drop_index("ix_places_glow_score", table_name="places")
    op.drop_index("ix_places_source", table_name="places")
    op.drop_index("ix_places_location_gist", table_name="places")
    op.drop_table("places")
