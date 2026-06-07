const bcrypt = require("bcryptjs");
const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/prisma");
const { publicUser, setSessionCookie, signSession } = require("../../../../lib/auth");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "An account already exists with this email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash }
    });

    setSessionCookie(signSession(user.id));

    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Registration failed." }, { status: 500 });
  }
}
