import { Link, useLocation } from "react-router-dom";

export default function MyPostsPage() {
  const location = useLocation();

  const message =
    typeof location.state?.message === "string" ? location.state.message : "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {message && (
        <div
          role="status"
          className="mb-6 rounded-md bg-green-50 p-4 text-green-700"
        >
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>

          <p className="mt-2 text-gray-600">
            Manage your drafts and published articles.
          </p>
        </div>

        <Link
          to="/create-post"
          className="rounded-md bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          Create post
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Your posts will appear here
        </h2>

        <p className="mt-2 text-gray-600">
          The next step is connecting this page to an authenticated backend
          endpoint that returns your own drafts and published posts.
        </p>
      </div>
    </main>
  );
}
