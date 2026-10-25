export const getPagination = (query: { page?: number; limit?: number }) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 && Number(query.limit) <= 100 ? Number(query.limit) : 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildPagination = (
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
};
