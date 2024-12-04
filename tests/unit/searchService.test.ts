import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchService } from '../../src/lib/services/searchService';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase');

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform basic search', async () => {
    const mockQuery = {
      data: [{ id: 1, title: 'Test Place' }],
      error: null,
      count: 1,
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue(mockQuery),
      }),
    } as any);

    const result = await searchService.search({
      searchQuery: 'test',
    });

    expect(result.data).toEqual(mockQuery.data);
    expect(result.count).toBe(1);
  });

  it('should apply all filters correctly', async () => {
    await searchService.search({
      searchQuery: 'test',
      serviceFilter: 'masonry-contractors',
      stateFilter: 'Tennessee',
      cityFilter: 'Nashville',
      serviceCategories: [
        {
          id: 'masonry-contractors',
          name: 'Masonry Contractors',
          searchTerms: ['Mason', 'Brick'],
        },
      ],
    });

    expect(supabase.from).toHaveBeenCalledWith('places');
  });
});
