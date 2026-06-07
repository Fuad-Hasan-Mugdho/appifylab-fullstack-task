const { randomUUID } = require("crypto");
const { mkdir, writeFile } = require("fs/promises");
const path = require("path");
const { NextResponse } = require("next/server");
const { prisma } = require("../../../lib/prisma");
const { requireUser } = require("../../../lib/auth");
const { serializePost } = require("../../../lib/serializers");

export const runtime = "nodejs";

function extensionFor(file) {
  const fallback = path.extname(file.name || "").toLowerCase();
  const fromType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
  }[file.type];
  return fromType || fallback || ".jpg";
}

async function saveImage(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return null;
  if (!file.type?.startsWith("image/")) {
    const error = new Error("Only image uploads are allowed.");
    error.status = 400;
    throw error;
  }
  if (file.size > 3 * 1024 * 1024) {
    const error = new Error("Image must be 3MB or smaller.");
    error.status = 400;
    throw error;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${randomUUID()}${extensionFor(file)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), bytes);
  return `/uploads/${fileName}`;
}

async function getVisiblePosts(userId) {
  const posts = await prisma.post.findMany({
    where: {
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }]
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: true
            }
          }
        }
      },
      author: true
    },
    take: 50
  });

  const postIds = posts.map((post) => post.id);
  const commentIds = posts.flatMap((post) => [
    ...post.comments.map((comment) => comment.id),
    ...post.comments.flatMap((comment) => comment.replies.map((reply) => reply.id))
  ]);
  const likes = await prisma.like.findMany({
    where: {
      OR: [
        { targetType: "POST", targetId: { in: postIds } },
        { targetType: "COMMENT", targetId: { in: commentIds } }
      ]
    },
    include: { user: true }
  });
  const likesByTarget = likes.reduce((map, like) => {
    const key = `${like.targetType}:${like.targetId}`;
    map[key] = map[key] || [];
    map[key].push(like);
    return map;
  }, {});

  posts.forEach((post) => {
    post.likes = likesByTarget[`POST:${post.id}`] || [];
    post.comments.forEach((comment) => {
      comment.likes = likesByTarget[`COMMENT:${comment.id}`] || [];
      comment.replies.forEach((reply) => {
        reply.likes = likesByTarget[`COMMENT:${reply.id}`] || [];
      });
    });
  });

  return posts.map((post) => serializePost(post, userId));
}

export async function GET() {
  try {
    const user = await requireUser();
    const posts = await getVisiblePosts(user.id);
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Unable to load posts." }, { status: error.status || 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const content = String(formData.get("content") || "").trim();
    const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";
    const imageUrl = await saveImage(formData.get("image"));

    if (!content && !imageUrl) {
      return NextResponse.json({ message: "Write something or choose an image." }, { status: 400 });
    }

    await prisma.post.create({
      data: {
        content,
        imageUrl,
        visibility,
        authorId: user.id
      }
    });

    const posts = await getVisiblePosts(user.id);
    return NextResponse.json({ posts }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message || "Unable to create post." }, { status: error.status || 500 });
  }
}
