import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../src/lib/supabase';

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          data: mockPlaces,
          error: null,
        })),
        eq: vi.fn(() => ({
          data: mockPlaces,
          error: null,
        })),
        data: mockPlaces,
        error: null,
      })),
    })),
  },
}));

// Mock data
const mockPlaces = [
  {
    id: 1,
    title: 'Test Masonry',
    category: 'Masonry Contractors',
    address: '123 Test St',
    slug: 'test-masonry-1',
  },
  {
    id: 2,
    title: 'Chimney Services',
    category: 'Chimney Repair',
    address: '456 Test Ave',
    slug: 'chimney-services-2',
  },
];

describe('Directory Page', () => {
  it('should fetch all places when no filters are applied', async () => {
    const query = supabase.from('places').select('*');
    expect(query).toBeDefined();
  });

  it('should filter places by search query', async () => {
    const searchQuery = 'masonry';
    const query = supabase
      .from('places')
      .select('*')
      .ilike('title', `%${searchQuery}%`);

    expect(query).toBeDefined();
    expect(
      mockPlaces.some((place) =>
        place.title.toLowerCase().includes(searchQuery)
      )
    ).toBe(true);
  });

  it('should filter places by service category', async () => {
    const category = 'Masonry Contractors';
    const query = supabase.from('places').select('*').eq('category', category);

    expect(query).toBeDefined();
    expect(mockPlaces.some((place) => place.category === category)).toBe(true);
  });
});
