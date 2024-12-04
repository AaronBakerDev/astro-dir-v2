import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface PaginationResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

export const DEFAULT_ITEMS_PER_PAGE = 12;

export async function paginateQuery<T>(
  query: PostgrestFilterBuilder<any, any, T[]>,
  params: PaginationParams = {}
): Promise<PaginationResult<T>> {
  const page = Math.max(1, params.page || 1);
  const itemsPerPage = params.itemsPerPage || DEFAULT_ITEMS_PER_PAGE;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Get total count first
  const countQuery = query.select('count', { count: 'exact', head: true });
  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error(`Error getting count: ${countError.message}`);
  }

  // Get paginated data
  const { data, error: dataError } = await query
    .range(from, to)
    .order('rating', { ascending: false });

  if (dataError) {
    throw new Error(`Error getting data: ${dataError.message}`);
  }

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    data: data || [],
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    totalItems,
  };
}

export function generatePaginationLinks(
  baseUrl: string,
  currentPage: number,
  totalPages: number,
  existingParams: URLSearchParams
): { prev: string | null; next: string | null; current: string } {
  const params = new URLSearchParams(existingParams);

  // Generate current page URL
  params.set('page', currentPage.toString());
  const current = `${baseUrl}?${params.toString()}`;

  // Generate previous page URL
  let prev: string | null = null;
  if (currentPage > 1) {
    const prevParams = new URLSearchParams(existingParams);
    prevParams.set('page', (currentPage - 1).toString());
    prev = `${baseUrl}?${prevParams.toString()}`;
  }

  // Generate next page URL
  let next: string | null = null;
  if (currentPage < totalPages) {
    const nextParams = new URLSearchParams(existingParams);
    nextParams.set('page', (currentPage + 1).toString());
    next = `${baseUrl}?${nextParams.toString()}`;
  }

  return { prev, next, current };
}
