import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { postService, type PostStatus } from "../services/postService";
import { categoryService } from "../services/categoryService";
import { useAuth } from "../context/AuthContext";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [image, setImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const createPostMutation = useMutation({
    mutationFn: postService.createPost,

    onSuccess: async (response) => {
      // Refresh cached post lists after successful creation.
      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      // Check the status returned by the BACKEND.
      if (response.data.status === "draft") {
        navigate("/my-posts", {
          state: {
            message: "Draft saved successfully.",
          },
        });
        return;
      }

      if (response.data.status === "published") {
        navigate(`/posts/${encodeURIComponent(response.data.slug)}`, {
          state: {
            message: "Post published successfully.",
          },
        });
        return;
      }

      // Do not silently navigate if the response is unexpected.
      setErrorMessage(
        "The post was created, but the server returned an unexpected status.",
      );
    },

    onError: (error: Error) => {
      // Keep the user on the form so they can correct the problem.
      setErrorMessage(error.message || "Failed to create post.");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !content.trim() || !categoryId) {
      setErrorMessage("Title, content, and category are required.");
      return;
    }

    if (createPostMutation.isPending) {
      return;
    }

    createPostMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      status,
      image,
    });
  }

  if (isLoading) {
    return <p className="p-8 text-center">Checking your session...</p>;
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-bold">Sign in to create a post</h1>

        <Link
          to="/login"
          state={{ from: location }}
          className="mt-4 inline-block text-blue-600 underline"
        >
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create a post</h1>

        <p className="mt-2 text-gray-600">
          Write your article and choose whether to save it as a draft or publish
          it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {errorMessage && (
          <div
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="mb-2 block font-medium text-gray-700"
          >
            Post title
          </label>

          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
            placeholder="Enter your post title"
            className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="mb-2 block font-medium text-gray-700"
          >
            Category
          </label>

          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            disabled={
              isCategoriesLoading ||
              isCategoriesError ||
              categories.length === 0
            }
            className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          >
            <option value="">
              {isCategoriesLoading
                ? "Loading categories..."
                : isCategoriesError
                  ? "Unable to load categories"
                  : categories.length === 0
                    ? "No categories available"
                    : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {isCategoriesError && (
            <div className="mt-2 text-sm text-red-600">
              <p>Could not load categories.</p>

              <button
                type="button"
                onClick={() => void refetchCategories()}
                className="underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isCategoriesLoading &&
            !isCategoriesError &&
            categories.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No categories exist yet. Create a category first.
              </p>
            )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-2 block font-medium text-gray-700"
          >
            Content
          </label>

          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            rows={10}
            placeholder="Write your article here..."
            className="w-full resize-y rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="mb-2 block font-medium text-gray-700"
          >
            Cover image (optional)
          </label>

          <input
            id="image"
            name="imageUrl"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium hover:file:bg-gray-200"
          />

          {image && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">Selected: {image.name}</p>

              <button
                type="button"
                onClick={() => {
                  setImage(null);

                  const input = document.getElementById(
                    "image",
                  ) as HTMLInputElement | null;

                  if (input) input.value = "";
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove image
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block font-medium text-gray-700"
          >
            Publishing status
          </label>

          <select
            id="status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PostStatus)}
            className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="draft">Save as draft</option>
            <option value="published">Publish now</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={
              createPostMutation.isPending ||
              isCategoriesLoading ||
              isCategoriesError ||
              categories.length === 0
            }
            className="rounded-md bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createPostMutation.isPending
              ? "Saving..."
              : status === "draft"
                ? "Save draft"
                : "Publish post"}
          </button>

          <Link
            to="/"
            className="rounded-md border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
