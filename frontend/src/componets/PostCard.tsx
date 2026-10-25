import { useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../types/post";

interface PostCardProps {
  post: Post;
}

const API_ORIGIN = "http://localhost:8000";

export default function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);

  const imageSrc = post.imageUrl
    ? post.imageUrl.startsWith("/")
      ? `${API_ORIGIN}${post.imageUrl}`
      : post.imageUrl
    : null;

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/posts/${encodeURIComponent(post.slug)}`}
        aria-label={`Read ${post.title}`}
      >
        {imageSrc && !imageError ? (
          <img
            src={imageSrc}
            alt={post.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-52 w-full object-cover"
          />
        ) : (
          <div className="flex h-52 items-center justify-center bg-gray-200 text-gray-500">
            No image available
          </div>
        )}
      </Link>

      <div className="p-5">
        <Link
          to={`/posts/${encodeURIComponent(post.slug)}`}
          className="hover:text-blue-600"
        >
          <h2 className="mb-3 text-xl font-bold">{post.title}</h2>
        </Link>

        <p className="mb-4 line-clamp-3 text-gray-600">{post.content}</p>

        <Link
          to={`/posts/${encodeURIComponent(post.slug)}`}
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Read article →
        </Link>
      </div>
    </article>
  );
}
