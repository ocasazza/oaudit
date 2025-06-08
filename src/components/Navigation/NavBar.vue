<template>
  <nav
    class="bg-primary-50 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-50 transition-colors duration-300">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center space-x-4">
          <RouterLink to="/"
            class="text-xl font-bold text-primary-900 hover:text-primary-700 transition-colors duration-200">
            Oudit
          </RouterLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <NavItem v-for="route in navigationRoutes" :key="route.name" :route="route" />
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu"
            class="p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
            :aria-expanded="isMobileMenuOpen" aria-label="Toggle navigation menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-secondary-200 py-4">
        <div class="flex flex-col space-y-2">
          <NavItem v-for="route in navigationRoutes" :key="route.name" :route="route" :is-mobile="true"
            @click="closeMobileMenu" />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavItem from './NavItem.vue'

const router = useRouter()
const isMobileMenuOpen = ref(false)

// Get routes that should show in navigation
const navigationRoutes = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta?.showInNav)
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0))
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
