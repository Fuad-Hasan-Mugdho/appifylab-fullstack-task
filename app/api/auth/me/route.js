const { NextResponse } = require("next/server");
const { getCurrentUser } = require("../../../../lib/auth");

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
