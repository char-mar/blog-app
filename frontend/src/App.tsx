import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import PostDetailsPage from "./pages/PostDetailsPage";
import MePage from "./pages/MePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProtectedRoute from "./componets/ProtectedRoute";
import MyPostsPage from "./pages/MyPostsPage";
import EditPostPage from "./pages/EditPostPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/posts/:slug" element={<PostDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* These pages require an authenticated user. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/me" element={<MePage />} />
        <Route path="/posts/create" element={<CreatePostPage />} />
      </Route>
      <Route path="/my-posts" element={<MyPostsPage />} />

      <Route path="/posts/:postId/edit" element={<EditPostPage />} />
    </Routes>
  );
}
