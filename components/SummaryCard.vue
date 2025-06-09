<template>
  <div
    class="bg-white shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div :class="[
          'flex items-center justify-center w-12 h-12 rounded-lg',
          colorClasses[color]
        ]">
          <component :is="iconComponent" class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-secondary-600">{{ title }}</p>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold text-secondary-900">
              <span v-if="loading" class="animate-pulse">--</span>
              <span v-else>{{ formattedValue }}</span>
            </p>
            <div v-if="trend && !loading" class="flex items-center space-x-1">
              <component
                :is="trend.direction === 'up' ? ChevronUpIcon : ChevronDownIcon"
                :class="[
                  'h-4 w-4',
                  trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                ]"
              />
              <span :class="[
                'text-sm font-medium',
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              ]">
                {{ trend.value }}
              </span>
              <span class="text-xs text-secondary-500">{{ trend.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="animate-spin">
        <ArrowPathIcon class="h-5 w-5 text-secondary-400" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  value: number | string
  loading?: boolean
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  trend?: {
    value: number
    direction: 'up' | 'down'
    label: string
  }
}

interface Emits {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<Emits>()

// Icon mapping
const iconMap = {
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon
}

// Color classes for the icon background
const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600'
}

// Computed properties
const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || UserIcon
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
