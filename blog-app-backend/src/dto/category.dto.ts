export interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
}
