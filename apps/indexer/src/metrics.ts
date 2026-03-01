import http from "node:http";
import client from "prom-client";

client.collectDefaultMetrics();

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
