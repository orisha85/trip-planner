export type GeocodeResult = { lat: number; lng: number; display: string };

export async function geocode(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      // Nominatim requires a descriptive user-agent per their usage policy
      "User-Agent": "trip-organizer (personal use)",
    },
    cache: "force-cache",
  });
  if (!res.ok) return null;
  const arr: Array<{ lat: string; lon: string; display_name: string }> =
    await res.json();
  const first = arr[0];
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, display: first.display_name };
}
