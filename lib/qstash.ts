import { Client } from "@upstash/qstash";

const globalForQStash = globalThis as unknown as {
  qstash: Client | undefined;
};

export const qstash =
  globalForQStash.qstash ?? new Client({ token: process.env.QSTASH_TOKEN! });

if (process.env.NODE_ENV !== "production") globalForQStash.qstash = qstash;
