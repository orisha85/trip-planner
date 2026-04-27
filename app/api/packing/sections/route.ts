import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { packingItems } from "@/db/schema";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const { from, to } = await req.json();
  if (!from?.trim() || !to?.trim()) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }
  await db.update(packingItems).set({ section: to.trim() }).where(eq(packingItems.section, from));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  await db.delete(packingItems).where(eq(packingItems.section, name));
  return new Response(null, { status: 204 });
}
