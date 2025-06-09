<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <ArrowPathIcon class="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading user details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-secondary-900 mb-2">Error Loading User</h2>
          <p class="text-secondary-600 mb-4">{{ error }}</p>
          <button
            @click="refreshUser"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- User Details -->
      <div v-else-if="user" class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="navigateTo('/users')"
              class="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ChevronLeftIcon class="h-4 w-4 mr-1" />
              Back to Users
            </button>
          </div>
          <div class="flex space-x-2">
            <button
              @click="viewAccessGraph"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors"
            >
              <ShareIcon class="h-4 w-4 mr-2" />
              View Access Graph
            </button>
            <button
              @click="refreshUser"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>

        <!-- User Profile Card -->
        <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
            <h1 class="text-2xl font-bold text-secondary-900">User Profile</h1>
          </div>
          <div class="p-6">
            <div class="flex items-start space-x-6">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 bg-primary-100 flex items-center justify-center">
                  <span class="text-2xl font-bold text-primary-700">
                    {{ getUserInitials(user) }}
                  </span>
                </div>
              </div>

              <!-- User Info -->
              <div class="flex-1 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Full Name</label>
                    <p class="text-lg font-semibold text-secondary-900">
                      {{ user.profile.firstName }} {{ user.profile.lastName }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Email</label>
                    <p class="text-lg text-secondary-900">{{ user.profile.email }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Status</label>
                    <span :class="[
                      'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                      getStatusColor(user.status)
                    ]">
                      {{ user.status }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Department</label>
                    <p class="text-lg text-secondary-900">{{ user.profile.department || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Title</label>
                    <p class="text-lg text-secondary-900">{{ user.profile.title || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Last Login</label>
                    <p class="text-lg text-secondary-900">{{ formatLastLogin(user.lastLogin) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Groups and Applications Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Groups -->
          <div class="bg-white shadow-sm border border-secondary-200">
            <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-secondary-900">
                  Groups ({{ userGroups.length }})
                </h2>
                <button
                  @click="refreshGroups"
                  :disabled="isLoading"
                  class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="userGroups.length === 0" class="text-center py-8">
                <UserGroupIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p class="text-secondary-500">No groups assigned</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="group in userGroups"
                  :key="group.id"
                  class="flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer"
                  @click="viewGroupDetails(group)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-100 flex items-center justify-center">
                      <UserGroupIcon class="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-secondary-900">{{ group.profile.name }}</p>
                      <p class="text-xs text-secondary-500">{{ group.profile.description || 'No description' }}</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Applications -->
          <div class="bg-white shadow-sm border border-secondary-200">
            <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-secondary-900">
                  Applications ({{ userApps.length }})
                </h2>
                <button
                  @click="refreshApps"
                  :disabled="isLoading"
                  class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="userApps.length === 0" class="text-center py-8">
                <BuildingOfficeIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p class="text-secondary-500">No applications assigned</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="app in userApps"
                  :key="app.id"
                  class="flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer"
                  @click="viewAppDetails(app)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-purple-100 flex items-center justify-center">
                      <BuildingOfficeIcon class="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-secondary-900">{{ app.label }}</p>
                      <p class="text-xs text-secondary-500">{{ app.signOnMode || 'Unknown sign-on mode' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      app.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ app.status }}
                    </span>
                    <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Access Analysis -->
        <div class="bg-white shadow-sm border border-secondary-200">
          <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
            <h2 class="text-lg font-semibold text-secondary-900">Access Analysis</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{{ directAssignments }}</div>
                <div class="text-sm text-secondary-500">Direct Assignments</div>
                <div class="text-xs text-secondary-400 mt-1">Applications assigned directly to user</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ groupBasedAssignments }}</div>
                <div class="text-sm text-secondary-500">Via Groups</div>
                <div class="text-xs text-secondary-400 mt-1">Applications accessed through group membership</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">{{ ruleBasedAssignments }}</div>
                <div class="text-sm text-secondary-500">Via Rules</div>
                <div class="text-xs text-secondary-400 mt-1">Applications accessed through automated rules</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ShareIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useUsersStore } from '~/stores/users'
import { useAccessStore } from '~/stores/access'
import type { User, Group, Application } from '~/lib/okta/types'

// Get route params
const route = useRoute()
const userId = route.params.id as string

// Use Pinia stores
const usersStore = useUsersStore()
const accessStore = useAccessStore()

// Computed properties from store
const isLoading = computed(() => usersStore.loading)
const error = computed(() => usersStore.error)
const user = computed(() => usersStore.selectedUser)

// Mock data for groups and apps - in real app these would come from store
const userGroups = computed(() => {
  if (!user.value) return []
  return (user.value as any).groups || []
})

const userApps = computed(() => {
  if (!user.value) return []
  return (user.value as any).apps || []
})

// Access analysis computed properties
const directAssignments = computed(() => {
  return userApps.value.filter((app: any) => app.assignmentType === 'direct').length
})

const groupBasedAssignments = computed(() => {
  return userApps.value.filter((app: any) => app.assignmentType === 'group').length
})

const ruleBasedAssignments = computed(() => {
  return userApps.value.filter((app: any) => app.assignmentType === 'rule').length
})

// Methods
function getUserInitials(user: User): string {
  const first = user.profile.firstName?.[0] || ''
  const last = user.profile.lastName?.[0] || ''
  return (first + last).toUpperCase() || user.profile.email[0].toUpperCase()
}

function getStatusColor(status: string): string {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    STAGED: 'bg-yellow-100 text-yellow-800',
    PROVISIONED: 'bg-blue-100 text-blue-800',
    RECOVERY: 'bg-orange-100 text-orange-800',
    DEPROVISIONED: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function formatLastLogin(lastLogin?: string): string {
  if (!lastLogin) return 'Never'

  const date = new Date(lastLogin)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}

async function refreshUser() {
  await usersStore.fetchUserDetails(userId)
}

async function refreshGroups() {
  // In real app, this would refresh user groups
  await refreshUser()
}

async function refreshApps() {
  // In real app, this would refresh user applications
  await refreshUser()
}

function viewAccessGraph() {
  if (user.value) {
    navigateTo(`/graph?user=${encodeURIComponent(user.value.profile.email)}`)
  }
}

function viewGroupDetails(group: Group) {
  navigateTo(`/groups/${group.id}`)
}

function viewAppDetails(app: Application) {
  navigateTo(`/applications/${app.id}`)
}

// Lifecycle
onMounted(async () => {
  if (userId) {
    await refreshUser()
  }
})

// SEO
useHead({
  title: computed(() => {
    if (user.value) {
      return `${user.value.profile.firstName} ${user.value.profile.lastName} - Users - oudit`
    }
    return 'User Details - oudit'
  }),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        if (user.value) {
          return `View detailed information for ${user.value.profile.firstName} ${user.value.profile.lastName} including groups, applications, and access analysis`
        }
        return 'View detailed user information including groups, applications, and access analysis'
      })
    }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
