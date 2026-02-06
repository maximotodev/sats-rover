#!/bin/bash
# 1. Fetch the last 10,000 #satsrover events from major relays
# 2. Pipe them into a node script that calls our importer
echo "Pulling historical signals via nak..."

nak req -k 1 -t satsrover --limit 10000 \
  wss://relay.damus.io wss://relay.primal.net \
  | docker compose exec -T indexer node dist/bulk_import.js