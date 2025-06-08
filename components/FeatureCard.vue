<template>
  <div
    class="bg-white dark:bg-primary-800 shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 border border-secondary-100 dark:border-secondary-700 transform hover:-translate-y-1"
  >
    <div class="text-4xl mb-4 text-left filter drop-shadow-sm">
      {{ icon }}
    </div>
    <h3 class="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-3 text-left transition-colors duration-300">
      {{ title }}
    </h3>
    <p class="text-secondary-600 dark:text-secondary-300 text-left leading-relaxed transition-colors duration-300">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
}

defineProps<Props>()
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
