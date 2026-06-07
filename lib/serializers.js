function fullName(user) {
  return `${user.firstName} ${user.lastName}`;
}

function serializeLike(like) {
  return {
    id: like.id,
    userId: like.userId,
    userName: fullName(like.user)
  };
}

function serializeComment(comment, currentUserId) {
  const likes = comment.likes || [];
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.author.id,
      name: fullName(comment.author),
      email: comment.author.email
    },
    likes: likes.map(serializeLike),
    likedByMe: likes.some((like) => like.userId === currentUserId),
    replies: (comment.replies || []).map((reply) => serializeComment(reply, currentUserId))
  };
}

function serializePost(post, currentUserId) {
  const likes = post.likes || [];
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: fullName(post.author),
      email: post.author.email
    },
    likes: likes.map(serializeLike),
    likedByMe: likes.some((like) => like.userId === currentUserId),
    comments: (post.comments || []).map((comment) => serializeComment(comment, currentUserId))
  };
}

module.exports = { serializePost };
