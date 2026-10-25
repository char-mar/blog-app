// src/App.tsx

import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import PostDetailsPage from "./pages/PostDetailsPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MePage from "./pages/MePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/posts/:slug" element={<PostDetailsPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/me" element={<MePage />} />
    </Routes>
  );
}
