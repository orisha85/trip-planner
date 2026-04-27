import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { packingItems } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const items = await db.select().from(packingItems).orderBy(asc(packingItems.section), asc(packingItems.sortOrder));
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { section, label } = await req.json();
  if (!section?.trim() || !label?.trim()) {
    return NextResponse.json({ error: "section and label are required" }, { status: 400 });
  }
  const [created] = await db.insert(packingItems).values({ section: section.trim(), label: label.trim() }).returning();
  return NextResponse.json(created, { status: 201 });
}
