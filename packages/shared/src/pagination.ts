/**
 * Pagination (OpenAPI: page, limit; response totalCount + X-Total-Count).
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

export function parsePagination(query: { page?: string; limit?: string }): PaginationQuery {
  const page = Math.max(1, parseInt(String(query.page), 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(String(query.limit), 10) || PAGINATION.DEFAULT_LIMIT)
  );
  return { page, limit };
}
