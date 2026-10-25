import Navbar from "../componets/Navbar";
import Hero from "../componets/Hero";
import PostCard from "../componets/PostCard";
import { usePosts } from "../hooks/usePosts";

export default function HomePage() {
  const {
    data: posts,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = usePosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Hero />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Our blog
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Latest Articles
            </h1>

            <p className="mt-2 text-gray-600">
              Explore tutorials, lessons, and practical knowledge.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Initial loading state */}
        {isPending && (
          <p className="py-12 text-center text-gray-600">Loading articles...</p>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">
              Could not load articles.
            </p>

            <p className="mt-2 text-sm text-red-600">{error.message}</p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Successful response */}
        {!isPending &&
          !isError &&
          (posts?.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-gray-500">
              No articles available yet.
            </p>
          ))}
      </main>
    </div>
  );
}
