const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

export interface CommentThread extends Comment {
  replies: Comment[];
}

export interface CreateCommentInput {
  body: string;
  parentId?: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCommentsResponse {
  success: boolean;
  data: CommentThread[];
  pagination: PaginationMeta;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return result as T;
}

// Retrieve paginated comments and replies for a post.
async function getByPost(
  postId: string,
  page = 1,
  limit = 10,
): Promise<PaginatedCommentsResponse> {
  return request<PaginatedCommentsResponse>(
    `${API_URL}/posts/${encodeURIComponent(postId)}/comments?page=${page}&limit=${limit}`,
  );
}

// Create a top-level comment or a reply.
async function create(
  postId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  const result = await request<ApiResponse<Comment>>(
    `${API_URL}/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: "POST",
      body: JSON.stringify({
        body: input.body.trim(),
        ...(input.parentId ? { parentId: input.parentId } : {}),
      }),
    },
  );

  return result.data;
}

// Delete a comment or reply.
async function deleteComment(commentId: string): Promise<Comment> {
  const result = await request<ApiResponse<Comment>>(
    `${API_URL}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
    },
  );

  return result.data;
}

export const commentService = {
  getByPost,
  create,
  delete: deleteComment,
};
