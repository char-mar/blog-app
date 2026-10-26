import type { Post } from "../types/post";

// Base API URL.
// Example .env value: VITE_API_URL=http://localhost:8000/api
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// Post status values supported by the backend.
export type PostStatus = "draft" | "published";

// Input required to create a post.
export interface CreatePostInput {
  title: string;
  content: string;
  categoryId: string;
  status: PostStatus;
  image?: File | null;
}

// Input required to update an existing post.
// - Omit image to keep the current image.
// - Provide a File to replace the current image.
// - Removing an existing image requires backend support.
export interface UpdatePostInput {
  title: string;
  content: string;
  categoryId: string;
  status: PostStatus;
  image?: File | null;
}

// Standard API response.
export interface PostResponse {
  success: boolean;
  message?: string;
  data: Post;
}

export type CreatePostResponse = PostResponse;
export type UpdatePostResponse = PostResponse;

// Shared helper for sending HTTP requests.
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    // Send authentication cookies to the backend.
    credentials: "include",
  });

  // Some server responses may not contain valid JSON.
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    if (
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
    ) {
      message = result.message;
    }

    throw new Error(message);
  }

  return result as T;
}

// Extract the data field from the standard API response.
function getResponseData<T>(result: unknown): T {
  if (typeof result !== "object" || result === null || !("data" in result)) {
    throw new Error("Invalid response from server.");
  }

  return result.data as T;
}

// Fetch published posts for the home page.
async function getPosts(): Promise<Post[]> {
  const result = await request<unknown>(`${API_URL}/posts`);
  const data = getResponseData<unknown>(result);

  if (!Array.isArray(data)) {
    throw new Error("Invalid posts response from server.");
  }

  return data as Post[];
}

// Fetch a published post using its slug.
async function getPostBySlug(slug: string): Promise<Post> {
  const result = await request<unknown>(
    `${API_URL}/posts/slug/${encodeURIComponent(slug)}`,
  );

  const data = getResponseData<unknown>(result);

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Invalid article response from server.");
  }

  return data as Post;
}

// Fetch all posts belonging to the authenticated user.
async function getMyPosts(): Promise<Post[]> {
  const result = await request<unknown>(`${API_URL}/posts/me`);
  const data = getResponseData<unknown>(result);

  if (!Array.isArray(data)) {
    throw new Error("Invalid response when loading your posts.");
  }

  return data as Post[];
}

// Fetch one of the authenticated user's posts, including drafts.
// This must match the backend GET /api/posts/me/:id route.
async function getMyPostById(postId: string): Promise<Post> {
  const result = await request<unknown>(
    `${API_URL}/posts/me/${encodeURIComponent(postId)}`,
  );

  const data = getResponseData<unknown>(result);

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Invalid post response from server.");
  }

  return data as Post;
}

// Create a post, optionally including a cover image.
async function createPost(input: CreatePostInput): Promise<CreatePostResponse> {
  const formData = new FormData();

  formData.append("title", input.title.trim());
  formData.append("content", input.content.trim());
  formData.append("categoryId", input.categoryId);
  formData.append("status", input.status);

  if (input.image) {
    // Must match upload.single("imageUrl") in the Express route.
    formData.append("imageUrl", input.image);
  }

  return request<CreatePostResponse>(`${API_URL}/posts`, {
    method: "POST",
    body: formData,
  });
}

// Update an existing post, optionally replacing its cover image.
async function updatePost(
  postId: string,
  input: UpdatePostInput,
): Promise<UpdatePostResponse> {
  const formData = new FormData();

  formData.append("title", input.title.trim());
  formData.append("content", input.content.trim());
  formData.append("categoryId", input.categoryId);
  formData.append("status", input.status);

  if (input.image) {
    // Must match upload.single("imageUrl") in the Express route.
    formData.append("imageUrl", input.image);
  }

  return request<UpdatePostResponse>(
    `${API_URL}/posts/${encodeURIComponent(postId)}`,
    {
      method: "PATCH",
      body: formData,
    },
  );
}

// Delete an existing post.
async function deletePost(postId: string): Promise<void> {
  await request<unknown>(`${API_URL}/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
  });
}

// Central service object used by React components.
export const postService = {
  getPosts,
  getPostBySlug,
  getMyPosts,
  getMyPostById,
  createPost,
  updatePost,
  deletePost,
};

// Named exports for files that prefer direct imports.
export {
  getPosts,
  getPostBySlug,
  getMyPosts,
  getMyPostById,
  createPost,
  updatePost,
  deletePost,
};
