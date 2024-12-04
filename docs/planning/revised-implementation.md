# Revised Implementation Plan

## Current System Analysis

### Database Structure
```sql
table places {
  id: number
  title: string
  category: string
  rating: number
  rating_count: number
  address: string
  city: string[]
  province_state: string
  phone_number: string
  slug: string
}
```

## URL Structure Implementation

### 1. State/Province Pages (`/directory/[state]`)
```typescript
// Query pattern
const stateQuery = supabase
  .from('places')
  .select('*', { count: 'exact' })
  .eq('province_state', state)
  .order('rating', { ascending: false });
```

### 2. City Pages (`/directory/[state]/[city]`)
```typescript
// Query pattern
const cityQuery = supabase
  .from('places')
  .select('*', { count: 'exact' })
  .eq('province_state', state)
  .contains('city', [city])
  .order('rating', { ascending: false });
```

### 3. Service Category Pages (`/directory/services/[category]`)
```typescript
// Query pattern using existing search terms
const categoryQuery = supabase
  .from('places')
  .select('*', { count: 'exact' })
  .or(searchTerms.map(term => `category.ilike.%${term}%`));
```

## Implementation Phases

### Phase 1: Route Structure
1. Create new route files:
```
/src/pages/directory/
├── index.astro                    # Main directory page (existing)
├── [state]/
│   ├── index.astro               # State listing
│   └── [city]/
│       └── index.astro           # City listing
└── services/
    └── [category]/
        └── index.astro           # Service category listing
```

2. Update existing components:
```typescript
// Update SearchResults.astro to handle new URL patterns
<a href={`/directory/${place.province_state}/${place.city[0]}`}>
  View more in {place.city[0]}
</a>
```

### Phase 2: Query Adaptation

1. **State Pages**
```typescript
// [state]/index.astro
export async function getStaticPaths() {
  const { data: states } = await supabase
    .from('places')
    .select('province_state')
    .distinct();

  return states.map(({ province_state }) => ({
    params: { state: province_state },
  }));
}
```

2. **City Pages**
```typescript
// [state]/[city]/index.astro
export async function getStaticPaths() {
  const { data: places } = await supabase
    .from('places')
    .select('province_state, city');

  return places.flatMap(place => 
    place.city.map(city => ({
      params: { 
        state: place.province_state,
        city: city
      }
    }))
  );
}
```

### Phase 3: Component Updates

1. **Navigation Component**
```typescript
const Breadcrumb = ({ state, city, service }) => {
  const paths = [
    { href: '/directory', label: 'Directory' },
    state && { 
      href: `/directory/${state}`,
      label: state
    },
    city && {
      href: `/directory/${state}/${city}`,
      label: city
    },
    service && {
      href: `/directory/services/${service}`,
      label: service
    }
  ].filter(Boolean);
}
```

2. **Search Form Updates**
```typescript
// Update form to maintain URL structure
const handleSearch = (params) => {
  const searchParams = new URLSearchParams();
  if (params.state) searchParams.append('state', params.state);
  if (params.city) searchParams.append('city', params.city);
  if (params.service) searchParams.append('service', params.service);
  if (params.query) searchParams.append('search', params.query);
  
  return `/directory/search?${searchParams}`;
}
```

### Phase 4: SEO Optimization

1. **Meta Tags**
```typescript
// Dynamic meta tags based on route
const getMetaTags = ({ state, city, service }) => ({
  title: [
    'Find Local Chimney Professionals',
    state,
    city,
    service
  ].filter(Boolean).join(' | '),
  description: `Find trusted ${service || 'chimney'} professionals${
    city ? ` in ${city}` : ''
  }${state ? `, ${state}` : ''}`
});
```

2. **Sitemap Generation**
```typescript
// Generate sitemap entries
const generateSitemapEntries = async () => {
  const { data: places } = await supabase
    .from('places')
    .select('province_state, city');

  return places.flatMap(place => [
    `/directory/${place.province_state}`,
    ...place.city.map(city => 
      `/directory/${place.province_state}/${city}`
    )
  ]);
}
```

## Implementation Schedule

### Week 1: Route Structure
- Create new route files
- Implement basic page templates
- Set up navigation structure

### Week 2: Data Integration
- Implement query patterns for each route
- Add pagination support
- Update search functionality

### Week 3: UI/UX
- Update components for new structure
- Implement breadcrumb navigation
- Add meta tags and SEO elements

### Week 4: Testing & Optimization
- Test all routes and combinations
- Implement caching strategy
- Performance optimization

## Testing Strategy

1. **Route Testing**
```typescript
describe('URL Routes', () => {
  test('state pages load correctly', async () => {
    const response = await fetch('/directory/tennessee');
    expect(response.status).toBe(200);
  });

  test('city pages load correctly', async () => {
    const response = await fetch('/directory/tennessee/knoxville');
    expect(response.status).toBe(200);
  });
});
```

2. **Search Testing**
```typescript
describe('Search Functionality', () => {
  test('search with location filter works', async () => {
    const results = await searchBusinesses({
      query: 'roofing',
      state: 'tennessee',
      city: 'knoxville'
    });
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## Launch Checklist

1. **Pre-Launch**
   - [ ] All routes implemented and tested
   - [ ] Search functionality working with new structure
   - [ ] Navigation components updated
   - [ ] SEO elements in place

2. **Testing**
   - [ ] Test all route combinations
   - [ ] Verify search functionality
   - [ ] Check pagination
   - [ ] Validate meta tags

3. **Performance**
   - [ ] Implement caching strategy
   - [ ] Optimize database queries
   - [ ] Test load times 