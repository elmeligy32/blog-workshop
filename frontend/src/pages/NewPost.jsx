import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { fetchCategories } from "../api/categories";
import "./NewPost.css";

export default function NewPost() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data);
      setCategory((prev) => prev || data[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    client.get(`/posts/${id}/`).then((res) => {
      const post = res.data;
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category || "");
      setIsPublished(post.is_published);
      setLoading(false);
    });
  }, [id, isEditing]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content can't be empty.");
      return;
    }
    setError("");
    setSubmitting(true);
    const payload = {
      title,
      content,
      category: category || null,
      is_published: isPublished,
    };
    try {
      if (isEditing) {
        await client.patch(`/posts/${id}/`, payload);
      } else {
        const { data } = await client.post("/posts/", payload);
        navigate(`/posts/${data.id}`);
        return;
      }
      navigate(`/posts/${id}`);
    } catch {
      setError("Couldn't save the post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="container page"><p className="my-posts-muted">Loading…</p></div>;
  }

  return (
    <div className="container page">
      <h1>{isEditing ? "Edit post" : "New post"}</h1>

      <form className="post-form" onSubmit={handleSubmit}>
        <div className="post-form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            type="text"
            placeholder="A clear, specific title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="post-form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="post-form-field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            className="input post-form-textarea"
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <label className="post-form-checkbox">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publish immediately (otherwise saved as draft)
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="post-form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save post"}
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}