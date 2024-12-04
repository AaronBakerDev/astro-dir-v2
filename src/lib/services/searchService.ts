import { supabase } from '../supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface SearchFilters {
  searchQuery?: string;
  serviceFilter?: string;
  stateFilter?: string;
  cityFilter?: string;
  serviceCategories?: ServiceCategory[];
}

interface ServiceCategory {
  id: string;
  name: string;
  searchTerms: string[];
}

interface SearchOptions extends SearchFilters {
  page?: number;
  itemsPerPage?: number;
}

export class SearchService {
  private baseQuery() {
    return supabase.from('places').select('*', { count: 'exact' });
  }

  private applySearchQuery(
    query: PostgrestFilterBuilder<any, any>,
    searchQuery: string
  ) {
    return searchQuery ? query.ilike('title', `%${searchQuery}%`) : query;
  }

  private applyServiceFilter(
    query: PostgrestFilterBuilder<any, any>,
    serviceFilter: string,
    serviceCategories: ServiceCategory[]
  ) {
    if (!serviceFilter) return query;

    const selectedCategory = serviceCategories.find(
      (cat) => cat.id === serviceFilter
    );
    if (!selectedCategory) return query;

    const searchTerms = [
      selectedCategory.name,
      ...selectedCategory.searchTerms,
    ];
    const categoryConditions = searchTerms.map(
      (term) => `category.ilike.%${term}%`
    );
    return query.or(categoryConditions.join(','));
  }

  private applyLocationFilters(
    query: PostgrestFilterBuilder<any, any>,
    stateFilter?: string,
    cityFilter?: string
  ) {
    if (stateFilter) {
      query = query.eq('province_state', stateFilter);
    }

    if (cityFilter && stateFilter) {
      query = query.contains('city', [cityFilter]);
    }

    return query;
  }

  async search({
    searchQuery = '',
    serviceFilter = '',
    stateFilter = '',
    cityFilter = '',
    serviceCategories = [],
    page = 1,
    itemsPerPage = 12,
  }: SearchOptions) {
    try {
      let query = this.baseQuery();

      // Apply filters
      query = this.applySearchQuery(query, searchQuery);
      query = this.applyServiceFilter(query, serviceFilter, serviceCategories);
      query = this.applyLocationFilters(query, stateFilter, cityFilter);

      // Calculate pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Execute query with pagination
      const { data, error, count } = await query
        .order('rating', { ascending: false })
        .range(from, to);

      return {
        data,
        error,
        count,
        pagination: {
          currentPage: page,
          totalPages: count ? Math.ceil(count / itemsPerPage) : 0,
          totalItems: count || 0,
        },
      };
    } catch (error) {
      return {
        data: null,
        error: { message: 'An unexpected error occurred' },
        count: 0,
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
        },
      };
    }
  }
}

export const searchService = new SearchService();
