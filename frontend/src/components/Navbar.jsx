import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">TheBlog</Link>
        <Link to="/" className="navbar-link navbar-center">Posts</Link>
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/my-posts" className="navbar-link">My posts</Link>
              <Link to="/posts/new" className="btn btn-primary navbar-new-btn">New post</Link>
              <div className="navbar-user">
                <span className="navbar-avatar">{user.username[0].toUpperCase()}</span>
                <span className="navbar-username">{user.username}</span>
                <button className="navbar-link navbar-logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Log in</Link>
              <Link to="/register" className="btn btn-primary navbar-signup-btn">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}