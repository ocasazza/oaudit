<template>
  <NuxtLink
    :to="route.path"
    :class="[
      'flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors duration-200',
      isMobile ? 'w-full justify-start' : '',
      isActive
        ? 'bg-primary-100 text-primary-900 border border-primary-200'
        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
    ]"
    @click="$emit('click')"
  >
    <span v-if="route.meta?.icon" class="text-lg">{{ route.meta.icon }}</span>
    <span>{{ route.meta?.title || route.name }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RouteItem {
  name: string
  path: string
  meta?: {
    title?: string
    breadcrumb?: string
    showInNav?: boolean
    icon?: string
    order?: number
  }
}

interface Props {
  route: RouteItem
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

defineEmits<{
  click: []
}>()

const currentRoute = useRoute()

const isActive = computed(() => {
  return currentRoute.path === props.route.path ||
         (props.route.name && currentRoute.name === props.route.name)
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
