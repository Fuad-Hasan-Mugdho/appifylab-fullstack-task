const { NextResponse } = require("next/server");
const { prisma } = require("../../../../../lib/prisma");
const { requireUser } = require("../../../../../lib/auth");

async function canSeePost(postId, userId) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }]
    }
  });
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const content = String(body.content || "").trim();
    const parentId = body.parentId ? String(body.parentId) : null;

    if (!content) {
      return NextResponse.json({ message: "Comment text is required." }, { status: 400 });
    }

    const post = await canSeePost(params.postId, user.id);
    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    if (parentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: parentId, postId: params.postId, parentId: null }
      });
      if (!parent) {
        return NextResponse.json({ message: "Parent comment not found." }, { status: 404 });
      }
    }

    await prisma.comment.create({
      data: {
        content,
        postId: params.postId,
        parentId,
        authorId: user.id
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message || "Unable to add comment." }, { status: error.status || 500 });
  }
}
