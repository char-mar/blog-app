import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { getPostBySlug } from "../services/postService";
import Comments from "../componets/Comments";

const API_ORIGIN = "http://localhost:8000";

export default function PostDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [imageError, setImageError] = useState(false);

  const {
    data: post,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (!slug) {
    return <p className="p-6">Invalid article URL.</p>;
  }

  if (isPending) {
    return <p className="p-6">Loading article...</p>;
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4 text-red-600">
          {error instanceof Error
            ? error.message
            : "Could not load this article."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mr-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Try again
        </button>

        <Link to="/" className="text-blue-600 underline">
          Back home
        </Link>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="p-6">
        <p>Article not found.</p>
        <Link to="/" className="text-blue-600 underline">
          Back home
        </Link>
      </main>
    );
  }

  const imageSrc = post.imageUrl
    ? post.imageUrl.startsWith("/")
      ? `${API_ORIGIN}${post.imageUrl}`
      : post.imageUrl
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="mb-8 inline-block text-blue-600 hover:underline">
        ← Back to articles
      </Link>

      {imageSrc && !imageError ? (
        <img
          src={imageSrc}
          alt={post.title}
          onError={() => setImageError(true)}
          className="mb-8 max-h-[450px] w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-8 flex h-56 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          No image available
        </div>
      )}

      <h1 className="mb-4 text-3xl font-bold md:text-5xl">{post.title}</h1>

      <div className="mb-8 text-sm text-gray-500">
        {post.author?.name && <span>By {post.author.name} · </span>}

        {post.publishedAt && (
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
        )}
      </div>

      <article className="whitespace-pre-wrap text-lg leading-8 text-gray-700">
        {post.content}
      </article>

      {/* Comments and replies for this article */}
      <Comments postId={post.id} />
    </main>
  );
}
