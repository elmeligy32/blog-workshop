import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import "./MyPosts.css";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function loadPosts() {
    setLoading(true);
    client
      .get("/posts/mine/")
      .then((res) => setPosts(res.data.results))
      .catch(() => setError("Couldn't load your posts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function confirmDelete() {
    try {
      await client.delete(`/posts/${deleteId}/`);
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch {
      setError("Couldn't delete the post. Please try again.");
    } finally {
      setDeleteId(null);
    }
  }

  const drafts = posts.filter((p) => !p.is_published).length;

  return (
    <div className="container page">
      <div className="my-posts-header">
        <div>
          <h1>My posts</h1>
          <p className="lead">
            {posts.length} posts · {drafts} draft{drafts === 1 ? "" : "s"}
          </p>
        </div>
        <Link to="/posts/new" className="btn btn-primary">New post</Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="my-posts-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="my-posts-muted">You haven't written any posts yet.</p>
      ) : (
        <table className="my-posts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td className="my-posts-muted">{post.category_name || "—"}</td>
                <td>
                  <span className={`status-badge status-badge-${post.is_published ? "published" : "draft"}`}>
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="my-posts-muted">{formatDate(post.published_at || post.created_at)}</td>
                <td className="my-posts-actions">
                  <Link to={`/posts/${post.id}/edit`} className="btn btn-outline">Edit</Link>
                  <button className="btn btn-outline btn-delete" onClick={() => setDeleteId(post.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteId !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Delete this post?</h2>
            <p className="lead">This can't be undone.</p>
            <div className="post-form-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-primary" style={{ background: "var(--color-brand)" }} onClick={confirmDelete}>
                Delete
              </button>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}