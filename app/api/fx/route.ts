import { NextResponse } from "next/server";
import { getFxRate } from "@/lib/fx";
import { HOME_CURRENCY } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") ?? "").toUpperCase();
  const to = (searchParams.get("to") ?? HOME_CURRENCY).toUpperCase();

  if (!/^[A-Z]{3}$/.test(from)) {
    return NextResponse.json(
      { error: "from must be a 3-letter currency code" },
      { status: 400 },
    );
  }
  if (!/^[A-Z]{3}$/.test(to)) {
    return NextResponse.json(
      { error: "to must be a 3-letter currency code" },
      { status: 400 },
    );
  }

  try {
    const result = await getFxRate(from, to);
    return NextResponse.json({ from, to, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "fx error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
