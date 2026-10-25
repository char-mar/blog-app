import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function MePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-gray-600">Loading your account...</p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold">You are not signed in</h1>
        <p className="mt-2 text-gray-600">
          Sign in to view your account information.
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>

        <p className="mt-2 text-gray-600">
          Manage your blog account information.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-1 text-gray-900">{user.name || "Not provided"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="mt-1 capitalize text-gray-900">{user.role}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/posts/create"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create a post
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}
