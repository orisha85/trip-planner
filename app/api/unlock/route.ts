import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  createSessionToken,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const hash = process.env.APP_PASSWORD_HASH;
if (!hash) {
    return NextResponse.json(
      { error: "APP_PASSWORD_HASH not set" },
      { status: 500 },
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const password = body.password ?? "";
  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTS);
  return res;
}
