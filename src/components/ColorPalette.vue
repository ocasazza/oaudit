<template>
  <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-lg dark:shadow-2xl p-6 border border-secondary-100 dark:border-secondary-700 transition-all duration-300">
    <h3 class="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6 text-center transition-colors duration-300">
      🎨 Color Palette
    </h3>

    <!-- Primary Colors -->
    <div class="mb-8">
      <h4 class="text-lg font-medium text-primary-800 dark:text-primary-200 mb-4 transition-colors duration-300">
        Primary Colors
      </h4>
      <div class="grid grid-cols-5 sm:grid-cols-11 gap-2">
        <div class="text-center">
          <div class="bg-primary-50 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">50</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-100 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">100</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-200 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">200</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-300 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">300</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-400 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">400</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-500 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">500</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-600 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">600</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-700 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">700</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-800 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">800</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-900 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">900</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-950 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">950</div>
        </div>
      </div>
    </div>

    <!-- Secondary Colors -->
    <div class="mb-6">
      <h4 class="text-lg font-medium text-secondary-800 dark:text-secondary-200 mb-4 transition-colors duration-300">
        Secondary Colors
      </h4>
      <div class="grid grid-cols-5 sm:grid-cols-11 gap-2">
        <div class="text-center">
          <div class="bg-secondary-50 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">50</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-100 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">100</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-200 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">200</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-300 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">300</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-400 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">400</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-500 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">500</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-600 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">600</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-700 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">700</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-800 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">800</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-900 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">900</div>
        </div>
        <div class="text-center">
          <div class="bg-secondary-950 h-12 w-full rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-600"></div>
          <div class="text-xs mt-1 text-secondary-600 dark:text-secondary-400 font-mono">950</div>
        </div>
      </div>
    </div>

    <!-- Usage Examples -->
    <div class="mt-6 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 transition-colors duration-300">
      <h5 class="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
        💡 Usage Examples:
      </h5>
      <div class="text-xs text-secondary-600 dark:text-secondary-400 space-y-1 font-mono">
        <div>• <span class="text-primary-600">bg-primary-600</span> - Main brand color</div>
        <div>• <span class="text-secondary-500">text-secondary-500</span> - Body text</div>
        <div>• <span class="text-primary-100">bg-primary-50</span> - Light backgrounds</div>
        <div>• <span class="text-secondary-900">bg-secondary-900</span> - Dark backgrounds</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple color palette component - no interactive features
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
