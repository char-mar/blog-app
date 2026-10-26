export interface Category {
  id: string;
  name: string;
  slug: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`, {
      credentials: "include",
    });

    const result: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error("Failed to fetch categories.");
    }

    if (
      typeof result !== "object" ||
      result === null ||
      !("data" in result) ||
      !Array.isArray(result.data)
    ) {
      throw new Error("Invalid categories response from server.");
    }

    return result.data as Category[];
  },
};
