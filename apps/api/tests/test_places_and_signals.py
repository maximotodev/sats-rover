import unittest

from pydantic import ValidationError
from app.schemas.checkin import CheckinConfirmIn
from app.schemas.signal import PlaceFeedOut
from app.services.places_service import parse_bbox


class PlacesAndSignalsTests(unittest.TestCase):
    def test_parse_bbox_normalizes_and_rounds(self):
        bbox = parse_bbox("-89.3004,13.6004,-89.6004,13.3004")
        self.assertEqual(bbox.canonical_str(), "-89.6,13.3,-89.3,13.6")

    def test_parse_bbox_rejects_invalid_ranges(self):
        with self.assertRaises(ValueError):
            parse_bbox("-189,10,-89,20")

    def test_place_feed_items_default_factory(self):
        a = PlaceFeedOut(place_id="btcmap:abc", confidence_score=0)
        b = PlaceFeedOut(place_id="btcmap:def", confidence_score=0)

        a.items.append(
            {
                "event_id": "a" * 64,
                "pubkey": "b" * 64,
                "status": "success",
                "content": "",
                "created_at": "2026-01-01T00:00:00Z",
            }
        )
        self.assertEqual(len(b.items), 0)

    def test_checkin_confirm_validates_hex(self):
        with self.assertRaises(ValidationError):
            CheckinConfirmIn(event_id="not-hex", place_id="btcmap:abc", pubkey="f" * 64)


if __name__ == "__main__":
    unittest.main()
