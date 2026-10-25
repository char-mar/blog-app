export interface CreatePostDto {
  title: string;
  content: string;
  categoryId: string;
  slug?: string;
  status?: "draft" | "published";
  imageUrl?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  categoryId?: string;
  slug?: string;
  status?: "draft" | "published";
  imageUrl?: string | null;
}
