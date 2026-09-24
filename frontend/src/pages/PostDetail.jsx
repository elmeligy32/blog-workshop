import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./PostDetail.css";

function formatDate(iso) {
  if (!iso) return "Draft";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    client
      .get(`/posts/${id}/`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await client.delete(`/posts/${id}/`);
      navigate("/my-posts");
    } catch {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <div className="container page"><p className="my-posts-muted">Loading…</p></div>;
  }

  if (notFound || !post) {
    return (
      <div className="container page">
        <h1>Post not found</h1>
        <p className="lead">It may have been removed, or it's a draft you don't have access to.</p>
        <Link to="/" className="btn btn-outline">Back to posts</Link>
      </div>
    );
  }

  const isOwner = post.is_owner ?? (user && user.id === post.author);

  return (
    <div className="container page post-detail">
      <div>
        <h1>{post.title}</h1>
        <div className="post-row-meta" style={{ marginTop: 16 }}>
          <span>{post.author_username}</span>
          <span className="post-row-dot">·</span>
          {post.category_name && <span className="badge">{post.category_name}</span>}
          <span className="post-row-dot">·</span>
          <span>{formatDate(post.published_at)}</span>
          {!post.is_published && <span className="badge status-badge-draft">Draft</span>}
        </div>
      </div>

      <div className="post-detail-content">
        {post.content.split("\n").map((para, i) => (
          para.trim() ? <p key={i}>{para}</p> : null
        ))}
      </div>

      {isOwner && (
        <div className="post-form-actions">
          <Link to={`/posts/${post.id}/edit`} className="btn btn-outline">Edit</Link>
          <button className="btn btn-outline btn-delete" onClick={() => setConfirmOpen(true)}>
            Delete
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-backdrop" onClick={() => !deleting && setConfirmOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Delete this post?</h2>
            <p className="lead">This can't be undone.</p>
            <div className="post-form-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-outline btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}