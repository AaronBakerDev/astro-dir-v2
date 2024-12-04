# Direct Implementation Plan

## 1. Initial Setup (Week 1)

### Database Updates
```sql
-- Add necessary columns for new URL structure
ALTER TABLE businesses
ADD COLUMN url_slug VARCHAR(255);

-- Generate slugs for existing data
UPDATE businesses
SET url_slug = generate_slug(business_name, city, state);
```

### Create New Route Structure
```
/directory/
├── index.astro                              # Main directory page
├── [state]/
│   ├── index.astro                          # State listing
│   └── [city]/
│       ├── index.astro                      # City listing
│       └── [service]/
│           └── index.astro                  # Service in city
└── search/
    └── index.astro                          # Search results
```

## 2. Core Components (Week 1-2)

### Location Components
```typescript
// State selector with city relationship
const StateSelector = () => {
  const [selectedState, setSelectedState] = useState('')
  const [cities, setCities] = useState([])
  
  useEffect(() => {
    if (selectedState) {
      const stateCities = getCitiesForState(selectedState)
      setCities(stateCities)
    }
  }, [selectedState])
}
```

### Search Implementation
```typescript
// New search with location context
const handleSearch = async (query: string, location: Location) => {
  const results = await supabase
    .from('businesses')
    .select()
    .textSearch('searchable_content', query)
    .eq('state', location.state)
    .eq('city', location.city)
}
```

## 3. Data Layer (Week 2)

### Supabase Queries
```typescript
// Location-based queries
const getStateBusinesses = async (state: string) => {
  return await supabase
    .from('businesses')
    .select(`
      *,
      services (*),
      locations (*)
    `)
    .eq('state', state)
}

const getCityBusinesses = async (state: string, city: string) => {
  return await supabase
    .from('businesses')
    .select(`
      *,
      services (*),
      locations (*)
    `)
    .eq('state', state)
    .eq('city', city)
}
```

### Caching Layer
```typescript
// Edge caching configuration
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

## 4. UI Components (Week 2-3)

### Navigation
```typescript
// Breadcrumb component
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

// Filter sidebar
const FilterSidebar = ({ state, city }) => {
  return (
    <aside>
      <StateFilter currentState={state} />
      <CityFilter state={state} currentCity={city} />
      <ServiceFilter />
    </aside>
  )
}
```

## 5. Testing (Week 3)

### Test Cases
```typescript
describe('URL Routing', () => {
  test('state pages load correctly', async () => {
    const response = await fetch('/directory/tennessee')
    expect(response.status).toBe(200)
  })
  
  test('city pages load correctly', async () => {
    const response = await fetch('/directory/tennessee/knoxville')
    expect(response.status).toBe(200)
  })
})

describe('Search Functionality', () => {
  test('search with location filter works', async () => {
    const results = await searchBusinesses('roofing', 'tennessee', 'knoxville')
    expect(results.length).toBeGreaterThan(0)
  })
})
```

## 6. Performance Optimization (Week 3-4)

### Edge Caching
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

### Data Prefetching
```typescript
// Prefetch state data
export async function getStaticPaths() {
  const states = await getStates()
  return states.map(state => ({
    params: { state: state.slug },
    props: { stateData: state }
  }))
}
```

## Implementation Schedule

### Week 1
- Set up new route structure
- Update database schema
- Create basic components

### Week 2
- Implement data layer changes
- Build core UI components
- Set up caching

### Week 3
- Complete UI implementation
- Write and run tests
- Performance optimization

### Week 4
- Final testing
- Performance monitoring
- Documentation

## Technical Debt Considerations

1. **Data Structure**
   - URL slug generation and uniqueness
   - Location data normalization
   - Service category relationships

2. **Performance**
   - Query optimization
   - Edge caching strategy
   - Image optimization

3. **Maintenance**
   - Component documentation
   - Type definitions
   - Error handling

## Launch Checklist

1. **Pre-Launch**
   - [ ] All routes implemented
   - [ ] Database schema updated
   - [ ] Components tested
   - [ ] Performance baseline established

2. **Launch**
   - [ ] Deploy new structure
   - [ ] Verify all routes
   - [ ] Check search functionality
   - [ ] Validate location filtering

3. **Post-Launch**
   - [ ] Monitor error rates
   - [ ] Check performance metrics
   - [ ] Verify SEO implementation