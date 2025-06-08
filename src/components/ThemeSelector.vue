<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-secondary-800 mb-2">
        Theme
      </label>
      <div class="relative">
        <select
          v-model="selectedTheme"
          @change="changeTheme"
          class="w-full px-3 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none bg-secondary-50 text-primary-900"
        >
          <option
            v-for="theme in themes"
            :key="theme.name"
            :value="theme.name"
          >
            {{ theme.icon }} {{ theme.label }}
          </option>
        </select>
        <!-- Custom dropdown arrow -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <p class="mt-2 text-sm text-secondary-600">
        Choose your preferred color theme for the application.
      </p>
    </div>

    <!-- Theme Preview -->
    <div class="p-4 border border-secondary-200 bg-secondary-50/50">
      <div class="flex items-center space-x-3">
        <div class="text-2xl">{{ currentTheme.icon }}</div>
        <div>
          <div class="font-medium text-primary-900">{{ currentTheme.label }} Theme</div>
          <div class="text-sm text-secondary-600">Currently active theme</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

// Theme system with 5 themes using tailwindcss-themer
const themes = [
  { name: 'default', label: 'Light', icon: '☀️', className: '' },
  { name: 'dark-theme', label: 'Dark', icon: '🌙', className: 'dark-theme' },
  { name: 'disco-theme', label: 'Disco', icon: '🕺', className: 'disco-theme' },
  { name: 'forest-theme', label: 'Forest', icon: '🌲', className: 'forest-theme' },
  { name: 'pastel-theme', label: 'Pastel', icon: '🌸', className: 'pastel-theme' }
]

const selectedTheme = ref('default')

const currentTheme = computed(() => {
  return themes.find(theme => theme.name === selectedTheme.value) || themes[0]
})

// Initialize theme from localStorage or default to light
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    const theme = themes.find(t => t.name === savedTheme)
    if (theme) {
      selectedTheme.value = savedTheme
    }
  }
  // Theme is already applied in main.ts, just ensure it's in sync
})

// Watch for theme changes and apply them
watch(selectedTheme, () => {
  applyTheme()
  localStorage.setItem('theme', selectedTheme.value)
})

const applyTheme = () => {
  // Remove all theme classes
  document.documentElement.classList.remove('dark-theme', 'disco-theme', 'forest-theme', 'pastel-theme')

  // Add the current theme class (if not default)
  if (currentTheme.value.className) {
    document.documentElement.classList.add(currentTheme.value.className)
  }
}

const changeTheme = () => {
  // Theme will be applied automatically via the watcher
}
</script>

<style scoped>
/* Remove default select styling */
select {
  background-image: none;
}
</style>
