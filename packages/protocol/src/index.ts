export const SATSROVER_PROTOCOL = {
  VERSION: "1",
  KINDS: {
    SIGNAL: 30331,
    CLAIM: 30333,
    REVOKE: 30334,
  },
  TAGS: {
    PLACE: "p",
    STATUS: "s",
    TOPIC: "t",
  }
} as const;
