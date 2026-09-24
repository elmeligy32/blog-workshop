import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewPost from "./pages/NewPost";
import MyPosts from "./pages/MyPosts";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-posts"
            element={
              <RequireAuth>
                <MyPosts />
              </RequireAuth>
            }
          />
          <Route
            path="/posts/new"
            element={
              <RequireAuth>
                <NewPost />
              </RequireAuth>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <RequireAuth>
                <NewPost />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}