import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { packingItems } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const items = await db.select().from(packingItems).orderBy(asc(packingItems.section), asc(packingItems.sortOrder));
  return NextResponse.json(items);
}
