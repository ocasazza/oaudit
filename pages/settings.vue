<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">

      <div class="max-w-2xl mx-auto space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-primary-900 mb-4 transition-colors duration-300">
            settings
          </h1>
          <p class="text-lg text-secondary-600 transition-colors duration-300">
            Configure your application preferences
          </p>
        </div>
        <!-- Theme Settings -->
        <div
          class="bg-secondary-50/80 backdrop-blur-sm p-6 shadow-lg border border-secondary-200 transition-colors duration-300">
          <div class="flex items-center mb-6">
            <span class="text-2xl mr-3">🎨</span>
            <h2 class="text-2xl font-bold text-primary-900">Appearance</h2>
          </div>

          <ThemeSelector />

          <div class="max-w-4xl mx-auto">
            <ColorPalette />
          </div>
        </div>

        <!-- API Configuration -->
        <div
          class="bg-secondary-50/80 backdrop-blur-sm p-6 shadow-lg border border-secondary-200 transition-colors duration-300">
          <div class="flex items-center mb-6">
            <span class="text-2xl mr-3">🔑</span>
            <h2 class="text-2xl font-bold text-primary-900">API Configuration</h2>
          </div>

          <div class="space-y-6">
            <!-- Secret Token Field -->
            <div>
              <label class="block text-sm font-medium text-secondary-800 mb-2">
                Secret Token
              </label>
              <div class="relative">
                <input v-model="secretToken" :type="showToken ? 'text' : 'password'"
                  class="w-full px-3 py-2 pr-10 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your secret token" />
                <button @click="toggleTokenVisibility"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
                  type="button">
                  <span class="text-lg">{{ showToken ? '🙈' : '👁️' }}</span>
                </button>
              </div>
              <p class="mt-2 text-sm text-secondary-600">
                This token will be used for API authentication. It's stored in memory only and will be cleared when you
                refresh or close the page.
              </p>
            </div>

            <!-- Save Status -->
            <div v-if="saveStatus" class="p-3" :class="saveStatusClass">
              <div class="flex items-center">
                <span class="text-lg mr-2">{{ saveStatus.icon }}</span>
                <span class="text-sm font-medium">{{ saveStatus.message }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-4 pt-4 border-t border-secondary-200">
              <button @click="resetToken"
                class="px-4 py-2 text-secondary-600 hover:text-secondary-800 transition-colors duration-200">
                Reset
              </button>
              <button @click="saveToken" :disabled="!secretToken.trim()"
                class="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors duration-200">
                Save Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const secretToken = ref('')
const showToken = ref(false)
const saveStatus = ref<{ message: string; type: 'success' | 'error'; icon: string } | null>(null)

const saveStatusClass = computed(() => {
  if (!saveStatus.value) return ''
  return saveStatus.value.type === 'success'
    ? 'bg-green-50 text-green-800 border border-green-200'
    : 'bg-red-50 text-red-800 border border-red-200'
})

const toggleTokenVisibility = () => {
  showToken.value = !showToken.value
}

const saveToken = () => {
  if (secretToken.value.trim()) {
    saveStatus.value = {
      message: 'Token saved for this session!',
      type: 'success',
      icon: '✅'
    }

    // Clear status after 3 seconds
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  } else {
    saveStatus.value = {
      message: 'Please enter a valid token.',
      type: 'error',
      icon: '❌'
    }

    // Clear status after 3 seconds
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  }
}

const resetToken = () => {
  secretToken.value = ''
  saveStatus.value = {
    message: 'Token cleared successfully!',
    type: 'success',
    icon: '🗑️'
  }

  // Clear status after 3 seconds
  setTimeout(() => {
    saveStatus.value = null
  }, 3000)
}
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
