const bcrypt = require("bcryptjs");
const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/prisma");
const { publicUser, setSessionCookie, signSession } = require("../../../../lib/auth");

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const isValidPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    setSessionCookie(signSession(user.id));

    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}
