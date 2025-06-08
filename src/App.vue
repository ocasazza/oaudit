<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-primary-950 transition-colors duration-300">
    <div class="container mx-auto px-4 py-16">
      <!-- Theme Toggle Button - Fixed Position -->
      <div class="fixed top-6 right-6 z-10">
        <button
          class="p-3 bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-secondary-200 dark:border-secondary-700 flex items-center justify-center"
          @click="toggleTheme"
          :title="`Current: ${currentTheme.label} - Click to cycle themes`"
        >
          <span class="text-2xl">{{ currentTheme.icon }}</span>
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
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            @click="incrementCounter"
          >
            Count: {{ count }}
          </button>
          <button
            class="px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            @click="resetCounter"
          >
            Reset Counter
          </button>
        </div>

        <!-- Color Palette Section -->
        <div class="max-w-4xl mx-auto">
          <ColorPalette />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ColorPalette from './components/ColorPalette.vue'

const count = ref(0)

// Theme system with 5 themes using tailwindcss-themer
const themes = [
  { name: 'default', label: 'Light', icon: '☀️', className: '' },
  { name: 'dark-theme', label: 'Dark', icon: '🌙', className: 'dark-theme' },
  { name: 'disco-theme', label: 'Disco', icon: '🕺', className: 'disco-theme' },
  { name: 'forest-theme', label: 'Forest', icon: '🌲', className: 'forest-theme' },
  { name: 'pastel-theme', label: 'Pastel', icon: '🌸', className: 'pastel-theme' }
]

const currentThemeIndex = ref(0)
const currentTheme = ref(themes[0])

// Initialize theme from localStorage or default to light
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    const themeIndex = themes.findIndex(theme => theme.name === savedTheme)
    if (themeIndex !== -1) {
      currentThemeIndex.value = themeIndex
      currentTheme.value = themes[themeIndex]
    }
  }
  applyTheme()
})

// Watch for theme changes and apply them
watch(currentTheme, () => {
  applyTheme()
  localStorage.setItem('theme', currentTheme.value.name)
})

const applyTheme = () => {
  // Remove all theme classes
  document.documentElement.classList.remove('dark-theme', 'disco-theme', 'forest-theme', 'pastel-theme')

  // Add the current theme class (if not default)
  if (currentTheme.value.className) {
    document.documentElement.classList.add(currentTheme.value.className)
  }
}

const incrementCounter = () => {
  count.value++
}

const resetCounter = () => {
  count.value = 0
}

const toggleTheme = () => {
  // Cycle to next theme
  currentThemeIndex.value = (currentThemeIndex.value + 1) % themes.length
  currentTheme.value = themes[currentThemeIndex.value]
}

</script>

<style scoped>
/* Component-specific styles can go here */
</style>
