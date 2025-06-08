<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-primary-900 mb-6 transition-colors duration-300">
          About Oudit
        </h1>
        <p class="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto transition-colors duration-300">
          A vue.js application used to expose the oaudit cli tool. This UI allows a useRoute audit okta applications and users.
        </p>
        <!-- Color Palette Section -->
        <div class="max-w-4xl mx-auto">
          <ColorPalette />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorPalette from '../components/ColorPalette.vue'
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
