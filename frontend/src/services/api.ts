const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
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
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return result as T;
}
