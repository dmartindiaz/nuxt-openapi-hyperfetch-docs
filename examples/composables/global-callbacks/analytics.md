# Analytics Tracking

Track API usage and user behavior using global callbacks.

## Basic Analytics Tracking

```typescript
// plugins/analytics.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      analytics.track('api_request', {
        url,
        method: options.method || 'GET',
        timestamp: new Date().toISOString()
      })
    },
    
    onSuccess: ({ url, duration }) => {
      analytics.track('api_success', {
        url,
        duration
      })
    },
    
    onError: ({ url, error }) => {
      analytics.track('api_error', {
        url,
        statusCode: error.statusCode,
        message: error.message
      })
    }
  }
})
```

## Analytics Composable

```typescript
// composables/useAnalytics.ts
export function useAnalytics() {
  const track = (event: string, properties?: Record<string, any>) => {
    const data = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', data)
    }
    
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', event, properties)
      }
      
      // Custom analytics service
      // $fetch('/api/analytics', { method: 'POST', body: data })
    }
  }
  
  const page = (path: string) => {
    track('page_view', { path })
  }
  
  const identify = (userId: string, traits?: Record<string, any>) => {
    track('identify', { userId, ...traits })
  }
  
  return {
    track,
    page,
    identify
  }
}
```

## Performance Tracking

```typescript
// plugins/performance-tracking.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  const requestTimes = new Map<string, number>()
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url }) => {
      requestTimes.set(url, Date.now())
    },
    
    onResponse: ({ url }) => {
      const startTime = requestTimes.get(url)
      if (startTime) {
        const duration = Date.now() - startTime
        requestTimes.delete(url)
        
        analytics.track('api_performance', {
          url,
          duration,
          fast: duration < 500,
          slow: duration > 2000
        })
        
        // Warn about slow requests
        if (duration > 2000) {
          console.warn(`Slow API request: ${url} took ${duration}ms`)
        }
      }
    }
  }
})
```

## User Journey Tracking

```typescript
// plugins/user-journey.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  const user = useAuthUser()
  
  globalThis.$apiCallbacks = {
    onSuccess: ({ url, response }) => {
      // Track specific endpoints
      if (url.includes('/pets')) {
        if (url.includes('POST')) {
          analytics.track('pet_created', {
            userId: user.value?.id,
            petId: response.id
          })
        } else if (url.includes('PUT')) {
          analytics.track('pet_updated', {
            userId: user.value?.id,
            petId: response.id
          })
        } else if (url.includes('DELETE')) {
          analytics.track('pet_deleted', {
            userId: user.value?.id
          })
        }
      }
      
      if (url.includes('/orders')) {
        if (url.includes('POST')) {
          analytics.track('order_created', {
            userId: user.value?.id,
            orderId: response.id,
            amount: response.total
          })
        }
      }
    }
  }
})
```

## Feature Usage Tracking

```typescript
// plugins/feature-tracking.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  const featureUsage = useState<Record<string, number>>('featureUsage', () => ({}))
  
  const trackFeature = (feature: string) => {
    featureUsage.value[feature] = (featureUsage.value[feature] || 0) + 1
    
    analytics.track('feature_used', {
      feature,
      count: featureUsage.value[feature]
    })
  }
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      // Track feature usage based on endpoint
      if (url.includes('/pets')) {
        if (options.method === 'POST') {
          trackFeature('create_pet')
        } else if (options.method === 'PUT') {
          trackFeature('update_pet')
        } else if (options.method === 'DELETE') {
          trackFeature('delete_pet')
        } else {
          trackFeature('view_pets')
        }
      }
      
      if (url.includes('/search')) {
        trackFeature('search')
      }
      
      if (url.includes('/filter')) {
        trackFeature('filter')
      }
    }
  }
})
```

## Error Tracking

```typescript
// plugins/error-tracking.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  const errorCount = ref(0)
  
  globalThis.$apiCallbacks = {
    onError: ({ url, error }) => {
      errorCount.value++
      
      analytics.track('api_error', {
        url,
        statusCode: error.statusCode,
        message: error.message,
        count: errorCount.value
      })
      
      // Track error patterns
      if (errorCount.value > 5) {
        analytics.track('multiple_errors', {
          count: errorCount.value
        })
      }
    },
    
    onSuccess: () => {
      // Reset error count on success
      if (errorCount.value > 0) {
        errorCount.value = 0
      }
    }
  }
})
```

## Conversion Tracking

```typescript
// plugins/conversion-tracking.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  
  globalThis.$apiCallbacks = {
    onSuccess: ({ url, response }) => {
      // Track conversions
      if (url.includes('/orders') && response.id) {
        analytics.track('purchase', {
          orderId: response.id,
          value: response.total,
          currency: 'USD',
          items: response.items
        })
        
        // Google Analytics e-commerce
        if (window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: response.id,
            value: response.total,
            currency: 'USD'
          })
        }
      }
      
      if (url.includes('/signup') && response.userId) {
        analytics.track('signup_complete', {
          userId: response.userId,
          method: response.method
        })
      }
    }
  }
})
```

## Session Tracking

```typescript
// plugins/session-tracking.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  const sessionStart = Date.now()
  const apiCalls = ref(0)
  
  globalThis.$apiCallbacks = {
    onRequest: () => {
      apiCalls.value++
    }
  }
  
  // Track session end
  if (process.client) {
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStart
      
      analytics.track('session_end', {
        duration: sessionDuration,
        apiCalls: apiCalls.value,
        pages: window.history.length
      })
    })
  }
})
```

## A/B Testing

```typescript
// plugins/ab-testing.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  
  // Assign user to variant
  const variant = Math.random() < 0.5 ? 'A' : 'B'
  const abVariant = useState('abVariant', () => variant)
  
  // Track variant
  analytics.track('ab_test_assigned', {
    variant: abVariant.value
  })
  
  globalThis.$apiCallbacks = {
    onSuccess: ({ url, response }) => {
      // Track outcomes by variant
      if (url.includes('/orders')) {
        analytics.track('conversion', {
          variant: abVariant.value,
          value: response.total
        })
      }
    }
  }
})
```

## Real User Monitoring (RUM)

```typescript
// plugins/rum.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  
  const metrics = {
    requests: 0,
    errors: 0,
    totalDuration: 0,
    slowRequests: 0
  }
  
  globalThis.$apiCallbacks = {
    onRequest: () => {
      metrics.requests++
    },
    
    onSuccess: ({ duration }) => {
      metrics.totalDuration += duration || 0
      if (duration && duration > 2000) {
        metrics.slowRequests++
      }
    },
    
    onError: () => {
      metrics.errors++
    }
  }
  
  // Report metrics every 30 seconds
  if (process.client) {
    setInterval(() => {
      if (metrics.requests > 0) {
        analytics.track('rum_metrics', {
          requests: metrics.requests,
          errors: metrics.errors,
          errorRate: (metrics.errors / metrics.requests) * 100,
          avgDuration: metrics.totalDuration / metrics.requests,
          slowRequests: metrics.slowRequests
        })
        
        // Reset metrics
        metrics.requests = 0
        metrics.errors = 0
        metrics.totalDuration = 0
        metrics.slowRequests = 0
      }
    }, 30000)
  }
})
```

## Complete Example

```vue
<script setup lang="ts">
import { useFetchPets, useCreatePet } from '~/composables/pets'
import { useAnalytics } from '~/composables/useAnalytics'

const analytics = useAnalytics()

// Track page view
onMounted(() => {
  analytics.page('/pets')
})

// Fetch pets - automatically tracked
const { data: pets } = useFetchPets()

// Create pet form
const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    // Additional custom tracking
    analytics.track('pet_form_submitted', {
      success: true,
      petId: pet.id,
      formData: {
        species: form.species
      }
    })
    
    form.name = ''
    form.species = ''
  },
  onError: (error) => {
    // Track form errors
    analytics.track('pet_form_submitted', {
      success: false,
      error: error.message
    })
  }
})

const handleSubmit = async () => {
  analytics.track('pet_form_submit_clicked')
  await createPet(form)
}

// Track form interactions
watch(() => form.species, (newValue) => {
  if (newValue) {
    analytics.track('species_selected', { species: newValue })
  }
})
</script>

<template>
  <div class="pets-page">
    <h1>Pets Management</h1>
    
    <form @submit.prevent="handleSubmit">
      <input 
        v-model="form.name" 
        placeholder="Name" 
        required
        @focus="analytics.track('name_input_focused')"
      />
      <select 
        v-model="form.species" 
        required
        @focus="analytics.track('species_select_focused')"
      >
        <option value="">Select species</option>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="bird">Bird</option>
      </select>
      <button type="submit" :disabled="loading">
        Create Pet
      </button>
    </form>
    
    <div class="pets-list">
      <div 
        v-for="pet in pets" 
        :key="pet.id"
        @click="analytics.track('pet_clicked', { petId: pet.id })"
      >
        {{ pet.name }} - {{ pet.species }}
      </div>
    </div>
  </div>
</template>
```

## Next Steps

- [Skip Patterns →](/examples/composables/global-callbacks/skip-patterns)
- [Auth Token →](/examples/composables/global-callbacks/auth-token)
- [Error Handling →](/examples/composables/global-callbacks/error-handling)
- [Global Callbacks Guide →](/composables/features/global-callbacks/overview)
