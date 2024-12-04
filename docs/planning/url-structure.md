# URL Structure Plan

## Current Structure Issues
1. Lack of geographic signals in URLs
2. Query parameter-based filtering reduces SEO value
3. Business profile URLs contain unnecessary numbers
4. Missing hierarchical location-based structure
5. Limited support for local SEO signals

## Proposed SEO-Optimized Structure

### Main Directory Routes
```
/directory                           # Main directory landing page
/directory/search                    # Search interface
```

### Service Category Routes
```
/directory/chimney-inspection       # Service category landing
/directory/masonry-contractors     # Service category landing
/directory/chimney-cleaning        # Service category landing
/directory/roofing-services        # Service category landing
```

### Location-Based Routes
```
/directory/[state]                          # State landing page
/directory/[state]/[city]                   # City landing page
/directory/[state]/[city]/[service]         # Local service category page
```

### Business Profile Routes
```
/directory/[state]/[city]/[business-name]   # Business profile page
```

### Combined Location + Service Routes
```
# State-level service pages
/directory/tennessee/masonry-contractors
/directory/maine/chimney-repair

# City-level service pages
/directory/tennessee/knoxville/masonry-contractors
/directory/maine/portland/chimney-repair
```

### Search & Filtering
```
# Use query parameters for filters, with canonical tags
/directory/[state]/[city]/masonry-contractors/?rating=5
/directory/[state]/[city]/masonry-contractors/?service=chimney-repair
```

## Content Organization
```
/directory/
  ├── /[service-category]/
  │    ├── /masonry-contractors/
  │    ├── /chimney-repair/
  │    └── /chimney-cleaning/
  ├── /[state]/
  │    ├── /tennessee/
  │    │    ├── /knoxville/
  │    │    │    ├── /masonry-contractors/
  │    │    │    └── /[business-name]/
  │    │    └── /nashville/
  │    └── /maine/
  └── /search/
```

## Technical Implementation Requirements

### SEO Optimizations
1. **Schema Markup Implementation**
   - LocalBusiness schema
   - Service schema
   - Organization schema
   - Address schema
   - Aggregate Rating schema

2. **Canonical URL Strategy**
   - Implement for pagination
   - Implement for filtered results
   - Handle multiple access paths

3. **XML Sitemaps**
   - Location-based sitemaps
   - Service category sitemaps
   - Business profile sitemaps
   - Update frequency settings

### URL Management
1. **301 Redirects**
   - Map old query parameter URLs to new paths
   - Preserve existing SEO equity
   - Handle legacy business profile URLs

2. **Mobile Considerations**
   - Shorter URLs for mobile display
   - Clear breadcrumb implementation
   - Mobile-friendly navigation structure

### Metadata Strategy
1. **Title Tags**
   - Location-specific templates
   - Service-specific templates
   - Business profile templates

2. **Meta Descriptions**
   - Include location signals
   - Include service keywords
   - Dynamic business information

## Implementation Phases

### Phase 1: Core Structure
1. Create new route files following location hierarchy
2. Implement base templates
3. Set up schema markup

### Phase 2: SEO Foundation
1. Implement canonical URL system
2. Set up XML sitemaps
3. Configure 301 redirects

### Phase 3: Content Migration
1. Move existing content to new URL structure
2. Update internal links
3. Implement breadcrumbs

### Phase 4: Enhancement
1. Add schema markup
2. Implement metadata templates
3. Set up tracking and analytics

## Benefits
1. **Improved Local SEO**
   - Clear geographic signals
   - Better support for "near me" searches
   - Enhanced location relevance

2. **Better Crawlability**
   - Clear content hierarchy
   - Logical internal linking
   - Improved site architecture

3. **User Experience**
   - Intuitive navigation
   - Clear location context
   - Better mobile experience

4. **Future Scalability**
   - Easy addition of new locations
   - Simple service category expansion
   - Flexible business profile structure

## Next Steps
1. Review and approve URL structure
2. Create route templates
3. Plan redirect strategy
4. Begin Phase 1 implementation