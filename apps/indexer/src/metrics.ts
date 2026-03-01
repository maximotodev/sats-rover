import http from "node:http";
import client from "prom-client";

let defaultMetricsStarted = false;
if (!defaultMetricsStarted) {
  client.collectDefaultMetrics();
  defaultMetricsStarted = true;
}

function getOrCreateCounter<T extends string>(
  name: string,
  help: string,
  labelNames: T[],
): client.Counter<T> {
  const existing = client.register.getSingleMetric(name) as
    | client.Counter<T>
    | undefined;
  if (existing) return existing;
  return new client.Counter({
    name,
    help,
    labelNames,
  });
}

function getOrCreateGauge<T extends string>(
  name: string,
  help: string,
  labelNames: T[],
): client.Gauge<T> {
  const existing = client.register.getSingleMetric(name) as
    | client.Gauge<T>
    | undefined;
  if (existing) return existing;
  return new client.Gauge({
    name,
    help,
    labelNames,
  });
}

export const eventsReceivedTotal = getOrCreateCounter(
  "events_received_total",
  "Total EVENT frames received by relay/kind/version",
  ["relay", "kind", "version"],
);

export const eventsAcceptedTotal = getOrCreateCounter(
  "events_accepted_total",
  "Total events accepted for processing",
  ["kind", "version"],
);

export const eventsRejectedTotal = getOrCreateCounter(
  "events_rejected_total",
  "Total events rejected at guard/fault decision points",
  ["reason", "kind", "version"],
);

export const wsReconnectTotal = getOrCreateCounter(
  "ws_reconnect_total",
  "Total relay reconnect attempts",
  ["relay"],
);

export const dbConflictTotal = getOrCreateCounter(
  "db_conflict_total",
  "Total DB conflict drops by conflict type",
  ["type"],
);

export const relayConnected = getOrCreateGauge(
  "relay_connected",
  "Relay websocket connection state (1 connected, 0 disconnected)",
  ["relay"],
);

export const watermarkValue = getOrCreateGauge(
  "watermark_value",
  "Watermark value by lane",
  ["lane"],
);

export const watermarkUpdatesTotal = getOrCreateCounter(
  "watermark_updates_total",
  "Total watermark updates by lane",
  ["lane"],
);

export function startMetricsServer(port: number): void {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
      try {
        const metrics = await client.register.metrics();
        res.statusCode = 200;
        res.setHeader("Content-Type", client.register.contentType);
        res.end(metrics);
      } catch {
        res.statusCode = 500;
        res.end("metrics_error");
      }
      return;
    }

    res.statusCode = 404;
    res.end("not_found");
  });

  server.listen(port, "0.0.0.0");
}
