import { NextResponse } from "next/server";
import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }
  const result = await geocode(q);
  if (!result) return NextResponse.json({ error: "no match" }, { status: 404 });
  return NextResponse.json(result);
}
