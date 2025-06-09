<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-900 mb-2">
          Okta Audit Dashboard
        </h1>
        <p class="text-secondary-600 text-lg">
          Comprehensive access auditing and relationship analysis
        </p>
        <div class="mt-4 flex items-center space-x-4">
          <button
            @click="openCommandPalette"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
            Search or Command
            <kbd class="ml-2 inline-flex items-center rounded border border-primary-200 px-1 font-sans text-xs text-primary-200">
              ⌘K
            </kbd>
          </button>
          <button
            @click="refreshData"
            :disabled="isLoading"
            class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
            {{ isLoading ? 'Loading...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Users"
          :value="stats.totalUsers"
          :loading="isLoading"
          icon="UserIcon"
          color="blue"
          :trend="{ value: 12, direction: 'up', label: 'vs last month' }"
          @click="navigateTo('/users')"
        />
        <SummaryCard
          title="Applications"
          :value="stats.totalApplications"
          :loading="isLoading"
          icon="BuildingOfficeIcon"
          color="green"
          :trend="{ value: 3, direction: 'up', label: 'new this month' }"
          @click="navigateTo('/applications')"
        />
        <SummaryCard
          title="Groups"
          :value="stats.totalGroups"
          :loading="isLoading"
          icon="UserGroupIcon"
          color="purple"
          :trend="{ value: 5, direction: 'down', label: 'empty groups' }"
          @click="navigateTo('/groups')"
        />
        <SummaryCard
          title="Active Rules"
          :value="stats.activeRules"
          :loading="isLoading"
          icon="CogIcon"
          color="orange"
          :trend="{ value: 2, direction: 'up', label: 'modified recently' }"
          @click="navigateTo('/rules')"
        />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Recent Activity -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Recent Access Events -->
          <div class="bg-white shadow-sm border border-secondary-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-secondary-900">Recent Access Events</h2>
              <NuxtLink
                to="/logs"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </NuxtLink>
            </div>
            <div class="space-y-3">
              <div
                v-for="event in recentEvents"
                :key="event.id"
                class="flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer"
                @click="viewEventDetails(event)"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div :class="[
                      'w-2 h-2 rounded-full',
                      event.type === 'success' ? 'bg-green-400' :
                      event.type === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    ]"></div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-secondary-900">{{ event.description }}</p>
                    <p class="text-xs text-secondary-500">{{ event.user }} • {{ event.application }}</p>
                  </div>
                </div>
                <div class="text-xs text-secondary-400">
                  {{ formatTimeAgo(event.timestamp) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Access Complexity Analysis -->
          <div class="bg-white shadow-sm border border-secondary-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-secondary-900">Access Complexity</h2>
              <button
                @click="navigateTo('/graph')"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Graph →
              </button>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ stats.directAssignments }}</div>
                <div class="text-sm text-secondary-500">Direct</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ stats.groupBasedAssignments }}</div>
                <div class="text-sm text-secondary-500">Via Groups</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">{{ stats.ruleBasedAssignments }}</div>
                <div class="text-sm text-secondary-500">Via Rules</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Quick Actions & Insights -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white shadow-sm border border-secondary-200 p-6">
            <h2 class="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
            <div class="space-y-3">
              <button
                @click="openCommandPalette"
                class="w-full flex items-center justify-between p-3 text-left bg-secondary-50 hover:bg-secondary-100 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <ShareIcon class="h-5 w-5 text-secondary-400" />
                  <span class="text-sm font-medium text-secondary-900">Trace User Access</span>
                </div>
                <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
              </button>
              <button
                @click="navigateTo('/graph')"
                class="w-full flex items-center justify-between p-3 text-left bg-secondary-50 hover:bg-secondary-100 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <ChartBarIcon class="h-5 w-5 text-secondary-400" />
                  <span class="text-sm font-medium text-secondary-900">View Access Graph</span>
                </div>
                <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
              </button>
              <button
                @click="navigateTo('/users?filter=stale')"
                class="w-full flex items-center justify-between p-3 text-left bg-secondary-50 hover:bg-secondary-100 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <ExclamationTriangleIcon class="h-5 w-5 text-secondary-400" />
                  <span class="text-sm font-medium text-secondary-900">Find Stale Access</span>
                </div>
                <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
              </button>
            </div>
          </div>

          <!-- Security Insights -->
          <div class="bg-white shadow-sm border border-secondary-200 p-6">
            <h2 class="text-lg font-semibold text-secondary-900 mb-4">Security Insights</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-900">Empty Groups</p>
                  <p class="text-xs text-secondary-500">Groups with no members</p>
                </div>
                <div class="text-lg font-semibold text-yellow-600">{{ stats.emptyGroups }}</div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-900">Unused Apps</p>
                  <p class="text-xs text-secondary-500">No access in 90 days</p>
                </div>
                <div class="text-lg font-semibold text-red-600">{{ stats.unusedApps }}</div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-900">Complex Paths</p>
                  <p class="text-xs text-secondary-500">3+ hops to access</p>
                </div>
                <div class="text-lg font-semibold text-purple-600">{{ stats.complexPaths }}</div>
              </div>
            </div>
          </div>

          <!-- Recent Rules Changes -->
          <div class="bg-white shadow-sm border border-secondary-200 p-6">
            <h2 class="text-lg font-semibold text-secondary-900 mb-4">Recent Rule Changes</h2>
            <div class="space-y-3">
              <div
                v-for="rule in recentRuleChanges"
                :key="rule.id"
                class="flex items-center justify-between p-3 bg-secondary-50"
              >
                <div>
                  <p class="text-sm font-medium text-secondary-900">{{ rule.name }}</p>
                  <p class="text-xs text-secondary-500">{{ rule.change }}</p>
                </div>
                <div class="text-xs text-secondary-400">
                  {{ formatTimeAgo(rule.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Command Palette -->
    <CommandPalette ref="commandPaletteRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ShareIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

// Components
import CommandPalette from '~/components/CommandPalette.vue'
import SummaryCard from '~/components/SummaryCard.vue'

// Pinia stores
import { useUsersStore } from '~/stores/users'
import { useApplicationsStore } from '~/stores/applications'
import { useAccessStore } from '~/stores/access'

// Use Pinia stores
const usersStore = useUsersStore()
const applicationsStore = useApplicationsStore()
const accessStore = useAccessStore()

// Reactive data
const isLoading = ref(false)
const commandPaletteRef = ref()

// Computed stats from stores
const stats = computed(() => ({
  totalUsers: usersStore.userStats.total,
  totalApplications: applicationsStore.applicationStats.total,
  totalGroups: 0, // Will be added when groups store is created
  activeRules: 0, // Will be added when rules store is created
  directAssignments: accessStore.complexityStats?.directAssignments || 0,
  groupBasedAssignments: accessStore.complexityStats?.groupBasedAssignments || 0,
  ruleBasedAssignments: accessStore.complexityStats?.ruleBasedAssignments || 0,
  emptyGroups: 0, // Will be calculated from groups store
  unusedApps: applicationsStore.applicationStats.inactive,
  complexPaths: 0 // Will be calculated from access complexity
}))

const recentEvents = ref([
  {
    id: '1',
    type: 'success',
    description: 'User logged into Salesforce',
    user: 'john.doe@company.com',
    application: 'Salesforce',
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    id: '2',
    type: 'warning',
    description: 'Failed login attempt',
    user: 'jane.smith@company.com',
    application: 'GitHub',
    timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
  },
  {
    id: '3',
    type: 'success',
    description: 'New user assigned to group',
    user: 'mike.wilson@company.com',
    application: 'Engineering Team',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: '4',
    type: 'error',
    description: 'Application access denied',
    user: 'sarah.jones@company.com',
    application: 'Admin Portal',
    timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  }
])

const recentRuleChanges = ref([
  {
    id: '1',
    name: 'Engineering Department Auto-Assignment',
    change: 'Modified condition',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    name: 'Marketing Team Access',
    change: 'Added new target group',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: '3',
    name: 'Contractor Access Rule',
    change: 'Deactivated',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
])

// Methods
function openCommandPalette() {
  commandPaletteRef.value?.openModal()
}

async function refreshData() {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In real app, fetch data from Okta API
    // const data = await getComprehensiveAuditData()
    // stats.value = data.summary

  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

function viewEventDetails(event: any) {
  // Navigate to detailed event view
  navigateTo(`/logs?event=${event.id}`)
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

// Lifecycle
onMounted(() => {
  // Load initial data
  refreshData()
})

// SEO
useHead({
  title: 'Okta Audit Dashboard - oudit',
  meta: [
    { name: 'description', content: 'Comprehensive Okta access auditing and relationship analysis dashboard' }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
