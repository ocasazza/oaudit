<template>
  <div class="bg-primary-50 shadow-lg p-6 border border-secondary-200 transition-all duration-300">
    <h3 class="text-2xl font-semibold text-primary-900 mb-6 text-center transition-colors duration-300">
      🎨 Color Palette
    </h3>

    <!-- Simple Color Grid -->
    <div class="space-y-4">
      <!-- Primary Colors -->
      <div>
        <h4 class="text-sm font-medium text-secondary-700">Primary</h4>
        <div class="flex flex-row">
          <div v-for="n in palleteNumbers" :key="n">
            <div :class="getClass(n, 'primary')"></div>
          </div>
        </div>
      </div>

      <!-- Secondary Colors -->
      <div>
        <h4 class="text-sm font-medium text-secondary-700">Secondary</h4>
        <div class="flex flex-row">
          <div v-for="n in palleteNumbers" :key="n">
            <div :class="getClass(n, 'secondary')"></div>
          </div>
        </div>
      </div>

      <!-- Tertiary Colors -->
      <div>
        <h4 class="text-sm font-medium text-secondary-700">Tertiary</h4>
        <div class="flex flex-row">
          <div v-for="n in palleteNumbers" :key="n">
            <div :class="getClass(n, 'tertiary')"></div>
          </div>
        </div>
      </div>

      <!-- Highlight Colors -->
      <div>
        <h4 class="text-sm font-medium text-secondary-700">Highlight</h4>
        <div class="flex flex-row">
          <div v-for="n in palleteNumbers" :key="n">
            <div :class="getClass(n, 'highlight')"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// Simple color palette component - no interactive features
const palleteNumbers = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950"
]

function getClass(n: string, colorType: string) {
  return `bg-${colorType}-${n} h-4 w-4 border border-highlight-50`;
}

</script>

<style scoped>
/* Component-specific styles can go here */
</style>
