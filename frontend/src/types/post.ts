export interface PostAuthor {
  id: string;
  name: string;
}

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  authorId: string;
  author?: PostAuthor | null;
  categoryId: string;
  title: string;
  content: string;
  slug: string;
  status: PostStatus;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
