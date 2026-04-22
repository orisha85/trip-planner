type CacheEntry = { rate: number; fetchedAt: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

export type FxResult = { rate: number; fetchedAt: string };

export async function getFxRate(from: string, to: string): Promise<FxResult> {
  const key = `${from}->${to}`;
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.fetchedAt < TTL_MS) {
    return { rate: cached.rate, fetchedAt: new Date(cached.fetchedAt).toISOString() };
  }

  if (from.toUpperCase() === to.toUpperCase()) {
    cache.set(key, { rate: 1, fetchedAt: now });
    return { rate: 1, fetchedAt: new Date(now).toISOString() };
  }

  const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
    from,
  )}&symbols=${encodeURIComponent(to)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
  const json: { rates?: Record<string, number> } = await res.json();
  const rate = json.rates?.[to.toUpperCase()];
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    throw new Error(`FX rate missing for ${from}→${to}`);
  }

  cache.set(key, { rate, fetchedAt: now });
  return { rate, fetchedAt: new Date(now).toISOString() };
}
