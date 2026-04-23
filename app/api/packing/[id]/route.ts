import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { packingItems } from "@/db/schema";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { checked } = await req.json();
  const [updated] = await db
    .update(packingItems)
    .set({ checked })
    .where(eq(packingItems.id, id))
    .returning();
  return NextResponse.json(updated);
}
