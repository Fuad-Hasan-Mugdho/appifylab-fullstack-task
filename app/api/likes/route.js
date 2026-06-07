const { NextResponse } = require("next/server");
const { prisma } = require("../../../lib/prisma");
const { requireUser } = require("../../../lib/auth");

async function canLikePost(targetId, userId) {
  return prisma.post.findFirst({
    where: {
      id: targetId,
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }]
    }
  });
}

async function canLikeComment(targetId, userId) {
  return prisma.comment.findFirst({
    where: {
      id: targetId,
      post: {
        OR: [{ visibility: "PUBLIC" }, { authorId: userId }]
      }
    }
  });
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const targetType = body.targetType === "COMMENT" ? "COMMENT" : "POST";
    const targetId = String(body.targetId || "");

    if (!targetId) {
      return NextResponse.json({ message: "Target is required." }, { status: 400 });
    }

    const target = targetType === "POST" ? await canLikePost(targetId, user.id) : await canLikeComment(targetId, user.id);
    if (!target) {
      return NextResponse.json({ message: "Target not found." }, { status: 404 });
    }

    const where = {
      targetType_targetId_userId: {
        targetType,
        targetId,
        userId: user.id
      }
    };

    const existingLike = await prisma.like.findUnique({ where });
    if (existingLike) {
      await prisma.like.delete({ where });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({
      data: { targetType, targetId, userId: user.id }
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message || "Unable to update like." }, { status: error.status || 500 });
  }
}
