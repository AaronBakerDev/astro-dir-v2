# Technical Implementation Plan

## Current System Analysis

### Existing URL Mechanics
```typescript
// Current URL handling
/directory
  - Query params: ?search, ?service, ?state, ?city, ?page
  - All filtering handled through URLSearchParams
  - Single Astro page handling all variations
```

### Current Data Flow
1. URL parameters parsed on page load
2. Supabase query built based on parameters
3. Results filtered client-side for additional parameters
4. State/city relationship managed through client-side JavaScript

## New System Architecture

### URL Pattern Implementation
```typescript
// Dynamic route structure in Astro
/directory/[state]/[city]/[service]/
  ├── /directory/[...slug].astro    // Catch-all route handler
  ├── /directory/[state]/index.astro // State landing page
  └── /directory/[state]/[city]/index.astro // City landing page
```

### Route Handlers
1. **Root Directory** (`/directory/index.astro`)
   ```typescript
   // Handles:
   - Default landing page
   - Search functionality
   - Category browsing
   ```

2. **State Pages** (`/directory/[state]/index.astro`)
   ```typescript
   // Handles:
   - State-specific listings
   - State-level category filters
   - Pagination for state results
   ```

3. **City Pages** (`/directory/[state]/[city]/index.astro`)
   ```typescript
   // Handles:
   - City-specific listings
   - Local service providers
   - City-level category filters
   ```

4. **Service Category Pages** (`/directory/[state]/[city]/[service]/index.astro`)
   ```typescript
   // Handles:
   - Service-specific listings
   - Location-based service filters
   - Category-specific content
   ```

## Data Layer Changes

### Supabase Query Modifications
```typescript
// Current query
const query = supabase
  .from('businesses')
  .select()
  .filter()

// New query structure
const query = supabase
  .from('businesses')
  .select(`
    *,
    services (*),
    locations (*)
  `)
  .eq('state', params.state)
  .eq('city', params.city)
  .eq('service_category', params.service)
```

### Data Caching Strategy
1. **Edge Caching**
   ```typescript
   // Implementation in route handlers
   export const config = {
     isr: {
       expiration: 3600, // 1 hour
       allowQuery: ['page']
     }
   }
   ```

2. **State/City Data**
   ```typescript
   // Cached location data
   const locationData = {
     states: new Map(),
     cities: new Map(),
     stateCity: new Map()
   }
   ```

## Migration Strategy

### Phase 1: Parallel Systems
```typescript
// Step 1: Create new route structure while maintaining old
/directory (old) -> Continues functioning
/directory-new/[state]/[city] (new) -> New implementation
```

### Phase 2: Data Migration
1. **Database Updates**
   ```sql
   -- Add new columns/indexes
   ALTER TABLE businesses
   ADD COLUMN url_slug VARCHAR(255);
   
   -- Update existing records
   UPDATE businesses
   SET url_slug = generate_slug(business_name, city, state);
   ```

2. **Content Migration**
   ```typescript
   // Migrate existing content to new structure
   async function migrateContent() {
     const businesses = await getAllBusinesses()
     for (const business of businesses) {
       await updateBusinessSlug(business)
       await generateLocationPages(business)
     }
   }
   ```

### Phase 3: URL Redirection
```typescript
// Implementation in old directory page
export async function getStaticPaths() {
  if (isLegacyUrl(Astro.url)) {
    return redirectToNewUrl(Astro.url)
  }
}
```

## Component Updates

### Navigation Components
```typescript
// New breadcrumb implementation
const Breadcrumb = ({ state, city, service }) => {
  return (
    <nav>
      <a href="/directory">Directory</a>
      {state && <a href={`/directory/${state}`}>{state}</a>}
      {city && <a href={`/directory/${state}/${city}`}>{city}</a>}
      {service && <span>{service}</span>}
    </nav>
  )
}
```

### Search Implementation
```typescript
// New search handling
const handleSearch = async (query: string) => {
  const searchParams = new URLSearchParams()
  if (state) searchParams.append('state', state)
  if (city) searchParams.append('city', city)
  searchParams.append('q', query)
  
  navigate(`/directory/search?${searchParams}`)
}
```

## Testing Strategy

### URL Pattern Tests
```typescript
// Test suite for URL patterns
describe('URL Patterns', () => {
  test('state urls resolve correctly', async () => {
    const response = await fetch('/directory/tennessee')
    expect(response.status).toBe(200)
  })
  
  test('city urls resolve correctly', async () => {
    const response = await fetch('/directory/tennessee/knoxville')
    expect(response.status).toBe(200)
  })
})
```

### Migration Tests
```typescript
// Test suite for redirects
describe('URL Redirects', () => {
  test('old urls redirect correctly', async () => {
    const response = await fetch('/directory?state=tennessee')
    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('/directory/tennessee')
  })
})
```

## Rollback Plan

### Emergency Rollback
```typescript
// Quick rollback implementation
export const config = {
  middleware: async (request) => {
    if (shouldRollback) {
      return redirect(getLegacyUrl(request.url))
    }
  }
}
```

### Monitoring
1. Set up error tracking for new routes
2. Monitor 404/500 errors
3. Track redirect success rates
4. Monitor performance metrics

## Performance Considerations

### Edge Caching Strategy
```typescript
// Cache configuration
export const config = {
  cache: {
    edges: {
      default: '1h',
      patterns: [
        {
          source: '/directory/:state/:city',
          duration: '4h'
        }
      ]
    }
  }
}
```

### SEO Monitoring
1. Set up tracking for:
   - Crawl rates
   - Index coverage
   - Search impressions
   - Click-through rates

## Next Steps

1. **Development**
   - Create new route handlers
   - Implement data layer changes
   - Build redirection system

2. **Testing**
   - Set up test environment
   - Create test cases
   - Implement monitoring

3. **Deployment**
   - Stage changes in test environment
   - Monitor performance
   - Gradual rollout to production 