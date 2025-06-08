<template>
  <div
    class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
  >
    <div class="text-4xl mb-4 text-center">
      {{ icon }}
    </div>
    <h3 class="text-xl font-semibold text-primary-900 mb-3 text-center">
      {{ title }}
    </h3>
    <p class="text-secondary-600 text-center leading-relaxed">
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
