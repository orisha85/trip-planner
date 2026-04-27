import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { packingItems } from "@/db/schema";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const patch: Partial<{ checked: boolean; label: string }> = {};
  if (body.checked !== undefined) patch.checked = body.checked;
  if (body.label !== undefined) patch.label = body.label.trim();
  const [updated] = await db.update(packingItems).set(patch).where(eq(packingItems.id, id)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(packingItems).where(eq(packingItems.id, id));
  return new Response(null, { status: 204 });
}
