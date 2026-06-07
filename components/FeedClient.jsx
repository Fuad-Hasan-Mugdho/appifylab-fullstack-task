"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function likedByText(likes) {
  if (!likes.length) return "No likes yet";
  return likes.map((like) => like.userName).join(", ");
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

function CommentForm({ placeholder, buttonText, onSubmit }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await onSubmit(content.trim());
    setContent("");
    setLoading(false);
  }

  return (
    <form className={buttonText === "Reply" ? "app_reply_form" : "app_comment_form"} onSubmit={submit}>
      <textarea className="form-control" placeholder={placeholder} value={content} onChange={(event) => setContent(event.target.value)} />
      <button className="app_post_btn" type="submit" disabled={loading}>
        {loading ? "..." : buttonText}
      </button>
    </form>
  );
}

function CommentItem({ comment, onLike, onReply }) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <>
      <div className="app_comment">
        <div className="app_avatar">{initials(comment.author.name)}</div>
        <div className="app_comment_bubble">
          <div className="app_comment_name">{comment.author.name}</div>
          <p className="app_comment_text">{comment.content}</p>
          <div className="app_comment_tools">
            <button className="app_inline_btn" type="button" onClick={() => onLike("COMMENT", comment.id)}>
              {comment.likedByMe ? "Unlike" : "Like"}
            </button>
            <button className="app_inline_btn" type="button" onClick={() => setReplyOpen((current) => !current)}>
              Reply
            </button>
            <span>{comment.likes.length} likes</span>
            <span className="app_liked_by">Liked by: {likedByText(comment.likes)}</span>
          </div>
          {replyOpen ? (
            <CommentForm
              placeholder="Write a reply"
              buttonText="Reply"
              onSubmit={async (content) => {
                await onReply(content, comment.id);
                setReplyOpen(false);
              }}
            />
          ) : null}
        </div>
      </div>
      {comment.replies.length ? (
        <div className="app_replies">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onLike={onLike} onReply={onReply} />
          ))}
        </div>
      ) : null}
    </>
  );
}

function PostCard({ post, onLike, onComment }) {
  const commentCount = useMemo(() => {
    return post.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
  }, [post.comments]);

  return (
    <article className="app_card app_post">
      <div className="app_post_header">
        <div className="app_avatar">{initials(post.author.name)}</div>
        <div>
          <h4 className="app_post_author">{post.author.name}</h4>
          <p className="app_post_meta">
            {formatDate(post.createdAt)} . {post.visibility === "PRIVATE" ? "Private" : "Public"}
          </p>
        </div>
      </div>
      <div className="app_post_body">
        {post.content ? <p>{post.content}</p> : null}
        {post.imageUrl ? <img src={post.imageUrl} alt="Post attachment" className="app_post_image" /> : null}
      </div>
      <div className="app_stats">
        <span>{post.likes.length} likes</span>
        <span>{commentCount} comments/replies</span>
        <span className="app_liked_by">Liked by: {likedByText(post.likes)}</span>
      </div>
      <div className="app_actions">
        <button className={`app_action_btn ${post.likedByMe ? "app_action_btn_active" : ""}`} type="button" onClick={() => onLike("POST", post.id)}>
          {post.likedByMe ? "Unlike" : "Like"}
        </button>
        <button className="app_action_btn" type="button">
          Comment
        </button>
      </div>
      <div className="app_comments">
        <CommentForm placeholder="Write a comment" buttonText="Comment" onSubmit={(content) => onComment(post.id, content)} />
        {post.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={onLike}
            onReply={(content, parentId) => onComment(post.id, content, parentId)}
          />
        ))}
      </div>
    </article>
  );
}

export default function FeedClient({ user }) {
  const router = useRouter();
  const fileInput = useRef(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const userName = `${user.firstName} ${user.lastName}`;

  async function loadPosts() {
    const data = await fetchJson("/api/posts");
    setPosts(data.posts);
  }

  useEffect(() => {
    loadPosts()
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function createPost(event) {
    event.preventDefault();
    setMessage("");
    setPosting(true);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    if (image) formData.append("image", image);

    try {
      const data = await fetchJson("/api/posts", {
        method: "POST",
        body: formData
      });
      setPosts(data.posts);
      setContent("");
      setImage(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(targetType, targetId) {
    setMessage("");
    try {
      await fetchJson("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId })
      });
      await loadPosts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addComment(postId, commentContent, parentId = null) {
    setMessage("");
    try {
      await fetchJson(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent, parentId })
      });
      await loadPosts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app_feed_shell _layout_main_wrapper">
      <header className="app_feed_header">
        <div className="container _custom_container app_feed_header_inner">
          <a href="/feed">
            <img src="/assets/images/logo.svg" alt="Buddy Script" className="_nav_logo" />
          </a>
          <div className="app_feed_user">
            <div className="app_avatar">{initials(userName)}</div>
            <div>
              <strong>{userName}</strong>
              <div>{user.email}</div>
            </div>
            <button className="app_logout_btn" type="button" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container _custom_container app_feed_grid">
        <section>
          <form className="app_card app_composer" onSubmit={createPost}>
            <div className="app_composer_top">
              <div className="app_avatar">{initials(userName)}</div>
              <textarea
                className="form-control"
                placeholder="Write something ..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </div>
            <div className="app_composer_controls">
              <input
                ref={fileInput}
                className="app_file_input"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
              />
              <select className="app_visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                <option value="PUBLIC">Public post</option>
                <option value="PRIVATE">Private post</option>
              </select>
              <button className="app_post_btn" type="submit" disabled={posting}>
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>

          {message ? <div className="app_message app_message_error mt-3">{message}</div> : null}
          {loading ? <div className="app_card app_empty mt-3">Loading feed...</div> : null}
          {!loading && posts.length === 0 ? <div className="app_card app_empty mt-3">No posts yet. Create the first one.</div> : null}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={toggleLike} onComment={addComment} />
          ))}
        </section>

        <aside className="app_card app_sidebar">
          <Image src="/assets/images/profile-cover-img.png" alt="Profile cover" width={320} height={130} style={{ borderRadius: 6, width: "100%", height: "auto" }} />
          <h4 className="mt-4">Task checklist</h4>
          <ul>
            <li>JWT authentication with httpOnly cookies</li>
            <li>Protected feed route</li>
            <li>Text and image posts</li>
            <li>Public/private visibility</li>
            <li>Likes with liked-by names</li>
            <li>Comments, replies, and likes</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
