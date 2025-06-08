<template>
  <nav v-if="breadcrumbs.length > 1"
    class="bg-primary-50 border-b border-secondary-200 py-3 transition-colors duration-300">
    <div class="container mx-auto px-4">
      <ol class="flex items-center space-x-2 text-sm">
        <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center">
          <!-- Separator -->
          <svg v-if="index > 0" class="w-4 h-4 text-secondary-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd" />
          </svg>

          <!-- Breadcrumb Item -->
          <div class="flex items-center space-x-1">
            <span v-if="crumb.icon" class="text-base">{{ crumb.icon }}</span>
            <RouterLink v-if="index < breadcrumbs.length - 1" :to="crumb.path"
              class="text-secondary-600 hover:text-primary-600 transition-colors duration-200">
              {{ crumb.title }}
            </RouterLink>
            <span v-else class="text-primary-900 font-medium">
              {{ crumb.title }}
            </span>
          </div>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Breadcrumb {
  title: string
  path: string
  icon?: string
}

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  const crumbs: Breadcrumb[] = []

  // Always start with home
  crumbs.push({
    title: 'Home',
    path: '/',
    icon: '🏠'
  })

  // Get all route segments
  const pathSegments = route.path.split('/').filter(segment => segment)

  // Build breadcrumbs from route segments
  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`

    // Find matching route
    const matchedRoute = router.getRoutes().find(r => r.path === currentPath)

    if (matchedRoute && matchedRoute.meta) {
      crumbs.push({
        title: matchedRoute.meta.breadcrumb || matchedRoute.meta.title || segment,
        path: currentPath,
        icon: matchedRoute.meta.icon
      })
    } else {
      // Fallback for dynamic routes or unmatched segments
      crumbs.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      })
    }
  }

  return crumbs
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
