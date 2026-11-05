import { PaginationMeta } from '@solace/shared';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (
  rawPage?: unknown,
  rawLimit?: unknown,
  defaultLimit = 20,
  maxLimit = 100,
): PaginationParams => {
  let page = parseInt(String(rawPage || 1), 10);
  let limit = parseInt(String(rawLimit || defaultLimit), 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
