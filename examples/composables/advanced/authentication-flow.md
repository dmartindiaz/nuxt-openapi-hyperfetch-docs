# Authentication Flow

Complete authentication flow with login, signup, logout, and protected routes.

## Login Page

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
import { useAuthLogin } from '~/composables/auth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const router = useRouter()
const form = reactive({
  email: '',
  password: ''
})

const { execute: login, loading, error } = useAuthLogin({
  immediate: false,
  onSuccess: (response) => {
    // Save token
    const token = useCookie('auth_token')
    token.value = response.token
    
    // Redirect to dashboard
    router.push('/dashboard')
  }
})

const handleLogin = async () => {
  await login(form)
}
</script>

<template>
  <div class="login-page">
    <h1>Login</h1>
    
    <form @submit.prevent="handleLogin">
      <input 
        v-model="form.email" 
        type="email" 
        placeholder="Email" 
        required 
      />
      <input 
        v-model="form.password" 
        type="password" 
        placeholder="Password" 
        required 
      />
      
      <div v-if="error" class="error">
        {{ error.message }}
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    
    <p>
      Don't have an account? 
      <NuxtLink to="/signup">Sign up</NuxtLink>
    </p>
  </div>
</template>
```

## Signup Page

```vue
<!-- pages/signup.vue -->
<script setup lang="ts">
import { useAuthSignup } from '~/composables/auth'

const router = useRouter()
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validationErrors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validate = () => {
  validationErrors.name = ''
  validationErrors.email = ''
  validationErrors.password = ''
  validationErrors.confirmPassword = ''
  
  let isValid = true
  
  if (!form.name) {
    validationErrors.name = 'Name is required'
    isValid = false
  }
  
  if (!form.email.includes('@')) {
    validationErrors.email = 'Valid email is required'
    isValid = false
  }
  
  if (form.password.length < 8) {
    validationErrors.password = 'Password must be at least 8 characters'
    isValid = false
  }
  
  if (form.password !== form.confirmPassword) {
    validationErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

const { execute: signup, loading, error } = useAuthSignup({
  immediate: false,
  onSuccess: (response) => {
    const token = useCookie('auth_token')
    token.value = response.token
    router.push('/dashboard')
  }
})

const handleSignup = async () => {
  if (!validate()) return
  await signup(form)
}
</script>

<template>
  <div class="signup-page">
    <h1>Sign Up</h1>
    
    <form @submit.prevent="handleSignup">
      <div>
        <input v-model="form.name" placeholder="Name" required />
        <span v-if="validationErrors.name" class="error">
          {{ validationErrors.name }}
        </span>
      </div>
      
      <div>
        <input v-model="form.email" type="email" placeholder="Email" required />
        <span v-if="validationErrors.email" class="error">
          {{ validationErrors.email }}
        </span>
      </div>
      
      <div>
        <input v-model="form.password" type="password" placeholder="Password" required />
        <span v-if="validationErrors.password" class="error">
          {{ validationErrors.password }}
        </span>
      </div>
      
      <div>
        <input v-model="form.confirmPassword" type="password" placeholder="Confirm Password" required />
        <span v-if="validationErrors.confirmPassword" class="error">
          {{ validationErrors.confirmPassword }}
        </span>
      </div>
      
      <div v-if="error" class="error">{{ error.message }}</div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Sign Up' }}
      </button>
    </form>
    
    <p>
      Already have an account? 
      <NuxtLink to="/login">Login</NuxtLink>
    </p>
  </div>
</template>
```

## Auth Middleware

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')
  
  if (!token.value) {
    return navigateTo('/login')
  }
})
```

```typescript
// middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token')
  
  if (token.value) {
    return navigateTo('/dashboard')
  }
})
```

## Protected Page

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
import { useFetchCurrentUser } from '~/composables/auth'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const token = useCookie('auth_token')

const { data: user, loading } = useFetchCurrentUser()

const logout = () => {
  token.value = null
  router.push('/login')
}
</script>

<template>
  <div class="dashboard">
    <header>
      <h1>Dashboard</h1>
      <button @click="logout">Logout</button>
    </header>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="user">
      <h2>Welcome, {{ user.name }}!</h2>
      <p>Email: {{ user.email }}</p>
    </div>
  </div>
</template>
```

## Auth Store

```typescript
// composables/useAuth.ts
export function useAuth() {
  const token = useCookie('auth_token')
  const user = useState<User | null>('auth_user', () => null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (email: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    
    token.value = response.token
    user.value = response.user
    
    return response
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }
  
  const fetchUser = async () => {
    if (!token.value) return null
    
    try {
      user.value = await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      return user.value
    } catch (error) {
      // Token invalid, logout
      logout()
      return null
    }
  }
  
  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser
  }
}
```

## Auto Fetch User

```typescript
// plugins/auth.ts
export default defineNuxtPlugin(async () => {
  const { token, fetchUser } = useAuth()
  
  // Fetch user on app load if token exists
  if (token.value) {
    await fetchUser()
  }
})
```

## Next Steps

- [File Upload →](/examples/composables/advanced/file-upload)
- [Pagination →](/examples/composables/advanced/pagination)
- [Caching →](/examples/composables/advanced/caching)
