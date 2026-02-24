type LogEvent = {
  service: "web";
  msg: string;
  [key: string]: unknown;
};

const ENABLE_LOGS = process.env.NODE_ENV !== "production";

export function logEvent(event: LogEvent): void {
  if (!ENABLE_LOGS) return;
  try {
    // Structured logs for local troubleshooting and transport/debug parity.
    console.info("[satsrover]", JSON.stringify(event));
  } catch {
    console.info("[satsrover]", event.msg);
  }
}
