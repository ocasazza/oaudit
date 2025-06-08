<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-primary-950 transition-colors duration-300">
    <div class="container mx-auto px-4 py-16">
      <!-- Theme Toggle Button - Fixed Position -->
      <div class="fixed top-6 right-6 z-10">
        <button
          class="p-3 bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-secondary-200 dark:border-secondary-700"
          @click="toggleTheme"
          :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <svg v-if="!isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        </button>
      </div>

      <div class="text-center">
        <h1 class="text-5xl font-bold text-primary-900 dark:text-primary-100 mb-6 transition-colors duration-300">
          Welcome to Oudit
        </h1>
        <p class="text-xl text-secondary-600 dark:text-secondary-300 mb-8 max-w-2xl mx-auto transition-colors duration-300">
          A modern Vue.js + TypeScript application powered by Nix flake for
          reproducible development environments.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            @click="incrementCounter"
          >
            Count: {{ count }}
          </button>
          <button
            class="px-6 py-3 bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            @click="resetCounter"
          >
            Reset Counter
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <FeatureCard
            title="Vue 3"
            description="Modern Vue.js with Composition API and TypeScript support"
            icon="⚡"
          />
          <FeatureCard
            title="Nix Flake"
            description="Reproducible development environment with declarative package management"
            icon="❄️"
          />
          <FeatureCard
            title="Tailwind CSS"
            description="Utility-first CSS framework with custom theme configuration"
            icon="🎨"
          />
        </div>

        <!-- Color Palette Section -->
        <div class="max-w-6xl mx-auto">
          <ColorPalette />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import FeatureCard from './components/FeatureCard.vue'
import ColorPalette from './components/ColorPalette.vue'

const count = ref(0)
const isDark = ref(false)

// Initialize theme from localStorage or system preference
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})

// Watch for theme changes and apply them
watch(isDark, () => {
  applyTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const incrementCounter = () => {
  count.value++
}

const resetCounter = () => {
  count.value = 0
}

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
