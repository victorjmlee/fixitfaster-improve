/** Shared KV client for Vercel KV / Upstash / Redis. */

type KvClient = {
  set: (k: string, v: string, opts?: { ex?: number }) => Promise<void>;
  get: (k: string) => Promise<string | null>;
  del: (k: string) => Promise<unknown>;
  keys: (pattern: string) => Promise<string[]>;
};

let cached: KvClient | null | undefined;

export async function getKv(): Promise<KvClient | null> {
  if (cached !== undefined) return cached;

  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const { createClient } = await import("redis");
      const client = createClient({ url: redisUrl });
      await client.connect();
      cached = {
        set: async (k, v, opts) => {
          await client.set(k, v, opts?.ex ? { EX: opts.ex } : {});
        },
        get: async (k) => client.get(k),
        del: async (k) => client.del(k),
        keys: async (pattern) => client.keys(pattern),
      };
      return cached;
    } catch (e) {
      console.warn("[kv] REDIS_URL connect failed:", e instanceof Error ? e.message : String(e));
    }
  }

  const url = process.env.KV_REST_API_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    try {
      const { createClient } = await import("@vercel/kv");
      const client = createClient({ url, token });
      cached = {
        set: async (k, v, opts) => {
          if (opts?.ex) await client.set(k, v, { ex: opts.ex });
          else await client.set(k, v);
        },
        get: async (k) => {
          const val = await client.get<string>(k);
          return val ?? null;
        },
        del: async (k) => client.del(k),
        keys: async (pattern) => client.keys(pattern),
      };
      return cached;
    } catch (e) {
      console.warn("[kv] Vercel KV connect failed:", e instanceof Error ? e.message : String(e));
    }
  }

  cached = null;
  return null;
}
