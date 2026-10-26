import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { postService } from "../services/postService";

export default function MePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [logoutError, setLogoutError] = useState("");

  // Fetch posts belonging to the authenticated user.
  const {
    data: posts = [],
    isLoading: isPostsLoading,
    isError: isPostsError,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["my-posts"],
    queryFn: postService.getMyPosts,
    enabled: isAuthenticated && !!user,
  });

  // Handle logout and clear cached private data.
  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      navigate("/login", { replace: true });
    },

    onError: (error: Error) => {
      setLogoutError(error.message || "Logout failed. Please try again.");
    },
  });

  // Delete a post and refresh affected post queries.
  const deletePostMutation = useMutation({
    mutationFn: postService.deletePost,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-posts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["posts"],
        }),
      ]);
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-gray-600">Loading your account...</p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold">You are not signed in</h1>

        <p className="mt-2 text-gray-600">
          Sign in to view your profile and manage your posts.
        </p>

        <Link
          to="/login"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const drafts = posts.filter((post) => post.status === "draft");
  const publishedPosts = posts.filter((post) => post.status === "published");

  function handleDeletePost(postId: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    );

    if (confirmed) {
      deletePostMutation.mutate(postId);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      {/* Profile section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              My Profile
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your account and blog content.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLogoutError("");
              logoutMutation.mutate();
            }}
            disabled={logoutMutation.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </button>
        </div>

        {logoutError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {logoutError}
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-1 break-words font-semibold text-gray-900">
              {user.name || "Not provided"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 break-words font-semibold text-gray-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="mt-1 capitalize font-semibold text-gray-900">
              {user.role}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/profile/edit"
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit profile
          </Link>

          <Link
            to="/posts/create"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create a post
          </Link>
        </div>
      </section>

      {/* Post statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total posts</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isPostsLoading ? "—" : posts.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {isPostsLoading ? "—" : drafts.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {isPostsLoading ? "—" : publishedPosts.length}
          </p>
        </div>
      </section>

      {/* Posts belonging to the authenticated user */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Posts</h2>
            <p className="mt-1 text-gray-600">
              Manage your drafts and published articles.
            </p>
          </div>

          <Link
            to="/posts/create"
            className="font-medium text-blue-600 hover:underline"
          >
            + New post
          </Link>
        </div>

        {deletePostMutation.isError && (
          <div
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {deletePostMutation.error instanceof Error
              ? deletePostMutation.error.message
              : "Could not delete the post. Please try again."}
          </div>
        )}

        {isPostsLoading && (
          <p className="py-10 text-center text-gray-500">
            Loading your posts...
          </p>
        )}

        {isPostsError && (
          <div className="mt-6 rounded-lg bg-red-50 p-4">
            <p role="alert" className="text-sm text-red-700">
              {postsError instanceof Error
                ? postsError.message
                : "Could not load your posts."}
            </p>

            <button
              type="button"
              onClick={() => void refetchPosts()}
              className="mt-2 text-sm font-medium text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isPostsLoading && !isPostsError && posts.length === 0 && (
          <div className="py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              You haven't created any posts yet
            </h3>

            <p className="mt-2 text-gray-500">
              Your saved drafts and published articles will appear here.
            </p>

            <Link
              to="/posts/create"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Write your first post
            </Link>
          </div>
        )}

        {!isPostsLoading && !isPostsError && posts.length > 0 && (
          <div className="mt-6 space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-semibold text-gray-900">
                    {post.title}
                  </h3>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {post.status === "published" && (
                    <Link
                      to={`/posts/${encodeURIComponent(post.slug)}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View post
                    </Link>
                  )}

                  <Link
                    to={`/posts/${encodeURIComponent(post.id)}/edit`}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id, post.title)}
                    disabled={deletePostMutation.isPending}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletePostMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
