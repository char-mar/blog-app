// src/App.tsx

import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import PostDetailsPage from "./pages/PostDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/posts/:slug" element={<PostDetailsPage />} />
    </Routes>
  );
}
