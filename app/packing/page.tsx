import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { packingItems } from "@/db/schema";
import { PackingList } from "@/components/packing-list";

export default async function PackingPage() {
  const items = await db
    .select()
    .from(packingItems)
    .orderBy(asc(packingItems.section), asc(packingItems.sortOrder));

  return (
    <div className="page">
      <div className="page-title"><em>Packing</em></div>
      <PackingList initial={items} />
    </div>
  );
}
