const { NextResponse } = require("next/server");
const { clearSessionCookie } = require("../../../../lib/auth");

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
