<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <ArrowPathIcon class="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading application details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-secondary-900 mb-2">Error Loading Application</h2>
          <p class="text-secondary-600 mb-4">{{ error }}</p>
          <button
            @click="refreshApplication"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- Application Details -->
      <div v-else-if="application" class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="navigateTo('/applications')"
              class="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ChevronLeftIcon class="h-4 w-4 mr-1" />
              Back to Applications
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
              @click="refreshApplication"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>

        <!-- Application Profile Card -->
        <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
            <h1 class="text-2xl font-bold text-secondary-900">Application Details</h1>
          </div>
          <div class="p-6">
            <div class="flex items-start space-x-6">
              <!-- App Icon -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span class="text-white font-bold text-2xl">
                    {{ getAppInitials(application) }}
                  </span>
                </div>
              </div>

              <!-- App Info -->
              <div class="flex-1 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Application Name</label>
                    <p class="text-lg font-semibold text-secondary-900">
                      {{ application.label }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Internal Name</label>
                    <p class="text-lg text-secondary-900">{{ application.name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Status</label>
                    <span :class="[
                      'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                      getStatusColor(application.status)
                    ]">
                      {{ application.status }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Sign-On Mode</label>
                    <p class="text-lg text-secondary-900">{{ formatSignOnMode(application.signOnMode) }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Created</label>
                    <p class="text-lg text-secondary-900">{{ formatDate(application.created) }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Last Updated</label>
                    <p class="text-lg text-secondary-900">{{ formatDate(application.lastUpdated) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users and Groups Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Assigned Users -->
          <div class="bg-white shadow-sm border border-secondary-200">
            <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-secondary-900">
                  Assigned Users ({{ appUsers.length }})
                </h2>
                <button
                  @click="refreshUsers"
                  :disabled="isLoading"
                  class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="appUsers.length === 0" class="text-center py-8">
                <UserIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p class="text-secondary-500">No users assigned</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="user in appUsers"
                  :key="user.id"
                  class="flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer"
                  @click="viewUserDetails(user)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 flex items-center justify-center">
                      <UserIcon class="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-secondary-900">
                        {{ user.profile.firstName }} {{ user.profile.lastName }}
                      </p>
                      <p class="text-xs text-secondary-500">{{ user.profile.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ user.status }}
                    </span>
                    <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assigned Groups -->
          <div class="bg-white shadow-sm border border-secondary-200">
            <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-secondary-900">
                  Assigned Groups ({{ appGroups.length }})
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
              <div v-if="appGroups.length === 0" class="text-center py-8">
                <UserGroupIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p class="text-secondary-500">No groups assigned</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="group in appGroups"
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
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-secondary-500">
                      {{ (group as any).memberCount || 0 }} members
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
                <div class="text-sm text-secondary-500">Direct User Assignments</div>
                <div class="text-xs text-secondary-400 mt-1">Users assigned directly to application</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ groupBasedAssignments }}</div>
                <div class="text-sm text-secondary-500">Via Groups</div>
                <div class="text-xs text-secondary-400 mt-1">Users accessing through group membership</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">{{ ruleBasedAssignments }}</div>
                <div class="text-sm text-secondary-500">Via Rules</div>
                <div class="text-xs text-secondary-400 mt-1">Users accessing through automated rules</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ShareIcon,
  UserIcon,
  UserGroupIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import type { Application, User, Group } from '~/lib/okta/types'

// Get route params
const route = useRoute()
const appId = route.params.id as string

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const application = ref<Application | null>(null)

// Mock data for users and groups - in real app these would come from API
const appUsers = ref<User[]>([])
const appGroups = ref<Group[]>([])

// Access analysis computed properties
const directAssignments = computed(() => {
  return appUsers.value.filter((user: any) => user.assignmentType === 'direct').length
})

const groupBasedAssignments = computed(() => {
  return appUsers.value.filter((user: any) => user.assignmentType === 'group').length
})

const ruleBasedAssignments = computed(() => {
  return appUsers.value.filter((user: any) => user.assignmentType === 'rule').length
})

// Methods
function getAppInitials(app: Application): string {
  const words = app.label.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return app.label.substring(0, 2).toUpperCase()
}

function getStatusColor(status: string): string {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function formatSignOnMode(mode?: string): string {
  if (!mode) return 'Unknown'

  const modes: Record<string, string> = {
    SAML_2_0: 'SAML 2.0',
    OPENID_CONNECT: 'OpenID Connect',
    SECURE_WEB_AUTHENTICATION: 'SWA',
    AUTO_LOGIN: 'Auto Login'
  }

  return modes[mode] || mode
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Unknown'

  const date = new Date(dateString)
  return date.toLocaleDateString()
}

async function refreshApplication() {
  isLoading.value = true
  error.value = null

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock application data
    application.value = {
      id: appId,
      name: 'github-app',
      label: 'GitHub Enterprise',
      status: 'ACTIVE',
      signOnMode: 'SAML_2_0',
      created: '2023-01-15T10:00:00Z',
      lastUpdated: '2024-06-08T09:30:00Z'
    }

    // Mock users data
    appUsers.value = [
      {
        id: '1',
        status: 'ACTIVE',
        created: '2023-01-15T10:00:00Z',
        lastLogin: '2024-06-08T09:30:00Z',
        lastUpdated: '2024-06-08T09:30:00Z',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          login: 'john.doe@company.com'
        }
      } as any,
      {
        id: '2',
        status: 'ACTIVE',
        created: '2023-02-20T14:00:00Z',
        lastLogin: '2024-06-07T16:45:00Z',
        lastUpdated: '2024-06-07T16:45:00Z',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@company.com',
          login: 'jane.smith@company.com'
        }
      } as any
    ]

    // Mock groups data
    appGroups.value = [
      {
        id: '1',
        type: 'OKTA_GROUP',
        created: '2023-01-15T10:00:00Z',
        lastUpdated: '2024-06-08T09:30:00Z',
        profile: {
          name: 'Engineering Team',
          description: 'Software engineers and developers'
        }
      } as any,
      {
        id: '2',
        type: 'OKTA_GROUP',
        created: '2023-02-20T14:00:00Z',
        lastUpdated: '2024-06-07T16:45:00Z',
        profile: {
          name: 'DevOps Team',
          description: 'DevOps and infrastructure team'
        }
      } as any
    ]

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load application'
    console.error('Error loading application:', err)
  } finally {
    isLoading.value = false
  }
}

async function refreshUsers() {
  // In real app, this would refresh application users
  await refreshApplication()
}

async function refreshGroups() {
  // In real app, this would refresh application groups
  await refreshApplication()
}

function viewAccessGraph() {
  if (application.value) {
    navigateTo(`/graph?application=${encodeURIComponent(application.value.label)}`)
  }
}

function viewUserDetails(user: User) {
  navigateTo(`/users/${user.id}`)
}

function viewGroupDetails(group: Group) {
  navigateTo(`/groups/${group.id}`)
}

// Lifecycle
onMounted(async () => {
  if (appId) {
    await refreshApplication()
  }
})

// SEO
useHead({
  title: computed(() => {
    if (application.value) {
      return `${application.value.label} - Applications - oudit`
    }
    return 'Application Details - oudit'
  }),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        if (application.value) {
          return `View detailed information for ${application.value.label} including assigned users, groups, and access analysis`
        }
        return 'View detailed application information including users, groups, and access analysis'
      })
    }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
