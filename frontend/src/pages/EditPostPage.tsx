import { useEffect, useState, type SyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { postService } from "../services/postService";
import { categoryService } from "../services/categoryService";

type PostStatus = "draft" | "published";

interface UpdatePostInput {
  title: string;
  content: string;
  categoryId: string;
  status: PostStatus;
  image: File | null;
}

export default function EditPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [image, setImage] = useState<File | null>(null);
  const [formError, setFormError] = useState("");

  // Load the existing post using its ID.
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = useQuery({
    queryKey: ["my-post", postId],
    queryFn: () => postService.getMyPostById(postId!),
    enabled: Boolean(postId),
  });

  // Load available categories.
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  // Populate the form when the post has loaded.
  useEffect(() => {
    if (!post) return;

    setTitle(post.title);
    setContent(post.content);
    setCategoryId(post.categoryId);
    setStatus(post.status);
  }, [post]);

  // Save the updated post.
  const updateMutation = useMutation({
    mutationFn: (input: UpdatePostInput) =>
      postService.updatePost(postId!, input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-posts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-post", postId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["posts"],
        }),
      ]);

      navigate("/me", {
        replace: true,
        state: {
          message: "Post updated successfully.",
        },
      });
    },

    onError: (error: Error) => {
      setFormError(error.message || "Could not update the post.");
    },
  });

  // Handle form submission.
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!title.trim() || !content.trim() || !categoryId) {
      setFormError("Title, content, and category are required.");
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      status,
      image,
    });
  }

  // Handle a missing post ID.
  if (!postId) {
    return <p className="p-8 text-red-600">Post ID is missing.</p>;
  }

  // Show a loading state while fetching the post.
  if (isPostLoading) {
    return <p className="p-8 text-gray-600">Loading post...</p>;
  }

  // Handle a failed request or a missing post.
  if (isPostError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Unable to load post</h1>

        <p className="mt-3 text-red-600">
          {postError instanceof Error
            ? postError.message
            : "The post could not be found."}
        </p>

        <Link
          to="/me"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to my profile
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <Link to="/me" className="text-sm text-blue-600 hover:underline">
          ← Back to my posts
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit post</h1>

        <p className="mt-2 text-gray-600">
          Update your article and save your changes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        {isCategoriesError && (
          <p role="alert" className="text-sm text-red-600">
            Unable to load categories. Please try again.
          </p>
        )}

        {/* Post title */}
        <div>
          <label htmlFor="title" className="mb-2 block font-medium">
            Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Post category */}
        <div>
          <label htmlFor="category" className="mb-2 block font-medium">
            Category
          </label>

          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            disabled={isCategoriesLoading || isCategoriesError}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              {isCategoriesLoading
                ? "Loading categories..."
                : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Post content */}
        <div>
          <label htmlFor="content" className="mb-2 block font-medium">
            Content
          </label>

          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            rows={12}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Optional replacement cover image */}
        <div>
          <label htmlFor="image" className="mb-2 block font-medium">
            Replace cover image (optional)
          </label>

          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600"
          />

          <p className="mt-1 text-sm text-gray-500">
            Leave this empty to keep the existing image. Your backend must treat
            an omitted image as unchanged.
          </p>
        </div>

        {/* Publishing status */}
        <div>
          <label htmlFor="status" className="mb-2 block font-medium">
            Post status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PostStatus)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Form actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={
              updateMutation.isPending ||
              isCategoriesLoading ||
              isCategoriesError
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </button>

          <Link
            to="/me"
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
