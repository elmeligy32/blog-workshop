import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { fetchCategories } from "../api/categories";
import "./Home.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [count, setCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ordering, setOrdering] = useState("-published_at");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { page, ordering };
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;

    client
      .get("/posts/", { params })
      .then((res) => {
        setPosts(res.data.results);
        setCount(res.data.count);
      })
      .catch(() => setError("Couldn't load posts. Please try again."))
      .finally(() => setLoading(false));
  }, [search, category, ordering, page]);

  function updateFilter(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  function formatDate(iso) {
    if (!iso) return "Draft";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="container page">
      <div>
        <h1>Latest posts</h1>
        <p className="lead">Everything published by the community, newest first.</p>
      </div>

      <div className="home-filters">
        <div className="search-field">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className="input search-input"
            type="text"
            placeholder="Search by title"
            value={search}
            onChange={updateFilter(setSearch)}
          />
        </div>
        <select className="select home-select" value={category} onChange={updateFilter(setCategory)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select className="select home-select" value={ordering} onChange={updateFilter(setOrdering)}>
          <option value="-published_at">Newest first</option>
          <option value="published_at">Oldest first</option>
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="post-list">
        {loading ? (
          <p className="post-list-empty">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="post-list-empty">No posts match your search.</p>
        ) : (
          posts.map((post) => (
            <article className="post-row" key={post.id}>
              <Link to={`/posts/${post.id}`} className="post-row-title-link">
                <h2 className="post-row-title">{post.title}</h2>
                <span className="post-row-arrow">→</span>
              </Link>
              <p className="post-row-excerpt">{post.excerpt}</p>
              <div className="post-row-meta">
                <span>{post.author_username}</span>
                <span className="post-row-dot">·</span>
                {post.category_name && <span className="badge">{post.category_name}</span>}
                <span className="post-row-dot">·</span>
                <span>{formatDate(post.published_at)}</span>
              </div>
            </article>
          ))
        )}
      </div>

      {!loading && posts.length > 0 && (
        <div className="post-list-footer">
          <span className="post-list-count">
            {count} posts · page {page} of {pageCount}
          </span>
          <div className="pagination">
            <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`btn ${n === page ? "btn-primary" : "btn-outline"} pagination-num`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button className="btn btn-outline" disabled={page === pageCount} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}