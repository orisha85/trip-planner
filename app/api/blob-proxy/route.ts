import { NextResponse, type NextRequest } from "next/server";
import { head } from "@vercel/blob";

export const runtime = "nodejs";

const PRIVATE_BLOB_HOST = "private.blob.vercel-storage.com";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!parsed.hostname.endsWith(PRIVATE_BLOB_HOST)) {
    return NextResponse.json({ error: "not a private blob url" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "blob token not configured" }, { status: 500 });
  }

  const meta = await head(url);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "blob not found" }, { status: 404 });
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": meta.contentType,
      "Content-Disposition": `inline; filename="${meta.pathname.split("/").pop()}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
