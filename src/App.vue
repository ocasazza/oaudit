<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-primary-900 mb-6">
          Welcome to Oudit
        </h1>
        <p class="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
          A modern Vue.js + TypeScript application powered by Nix flake for
          reproducible development environments.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
            @click="incrementCounter"
          >
            Count: {{ count }}
          </button>
          <button
            class="px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200 font-medium"
            @click="toggleTheme"
          >
            Toggle Theme
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FeatureCard from './components/FeatureCard.vue'

const count = ref(0)
const isDark = ref(false)

const incrementCounter = () => {
  count.value++
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // Theme toggle logic can be implemented here
  console.log('Theme toggled:', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
