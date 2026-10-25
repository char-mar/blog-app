import type { Post } from "../types/post";

const API_URL = "http://localhost:8000/api/posts";

// Fetch all posts for the home page.
export async function getPosts(): Promise<Post[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch posts.");
  }

  const result: unknown = await response.json();

  // Validate the response structure before accessing its data.
  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    !Array.isArray(result.data)
  ) {
    throw new Error("Invalid posts response from server.");
  }

  return result.data as Post[];
}

// Fetch one published post by its slug.
export async function getPostBySlug(slug: string): Promise<Post> {
  const response = await fetch(`${API_URL}/slug/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Article not found.");
    }

    if (response.status === 400) {
      throw new Error("Invalid article slug.");
    }

    throw new Error("Failed to fetch article.");
  }

  const result: unknown = await response.json();

  // Validate the response structure before accessing the post.
  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    typeof result.data !== "object" ||
    result.data === null ||
    Array.isArray(result.data)
  ) {
    throw new Error("Invalid article response from server.");
  }

  return result.data as Post;
}
