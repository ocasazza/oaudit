<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <ArrowPathIcon class="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading group details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-secondary-900 mb-2">Error Loading Group</h2>
          <p class="text-secondary-600 mb-4">{{ error }}</p>
          <button
            @click="refreshGroup"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- Group Details -->
      <div v-else-if="group" class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="navigateTo('/groups')"
              class="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ChevronLeftIcon class="h-4 w-4 mr-1" />
              Back to Groups
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
              @click="refreshGroup"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>

        <!-- Group Profile Card -->
        <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
            <h1 class="text-2xl font-bold text-secondary-900">Group Details</h1>
          </div>
          <div class="p-6">
            <div class="flex items-start space-x-6">
              <!-- Group Icon -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 bg-green-100 flex items-center justify-center">
                  <UserGroupIcon class="h-10 w-10 text-green-600" />
                </div>
              </div>

              <!-- Group Info -->
              <div class="flex-1 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Group Name</label>
                    <p class="text-lg font-semibold text-secondary-900">
                      {{ group.profile.name }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Description</label>
                    <p class="text-lg text-secondary-900">{{ group.profile.description || 'No description' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Type</label>
                    <span :class="[
                      'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                      getTypeColor(group.type)
                    ]">
                      {{ formatGroupType(group.type) }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Members</label>
                    <p class="text-lg text-secondary-900">{{ (group as any).memberCount || 0 }} members</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Created</label>
                    <p class="text-lg text-secondary-900">{{ formatDate(group.created) }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary-500 mb-1">Last Updated</label>
                    <p class="text-lg text-secondary-900">{{ formatDate(group.lastUpdated) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members and Applications Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Group Members -->
          <div class="bg-white shadow-sm border border-secondary-200">
            <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-secondary-900">
                  Members ({{ groupMembers.length }})
                </h2>
                <button
                  @click="refreshMembers"
                  :disabled="isLoading"
                  class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="groupMembers.length === 0" class="text-center py-8">
                <UserIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p class="text-secondary-500">No members in this group</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="member in groupMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer"
                  @click="viewMemberDetails(member)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 flex items-center justify-center">
                      <UserIcon class="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-secondary-900">
                        {{ member.profile.firstName }} {{ member.profile.lastName }}
                      </p>
                      <p class="text-xs text-secondary-500">{{ member.profile.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ member.status }}
                    </span>
                    <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assigned Applications -->
          <div class="bg-white shadow-sm border border-secondary-200">
            <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-secondary-900">
                  Applications ({{ groupApps.length }})
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
              <div v-if="groupApps.length === 0" class="text-center py-8">
                <BuildingOfficeIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p class="text-secondary-500">No applications assigned</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="app in groupApps"
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
                      <p class="text-xs text-secondary-500">{{ formatSignOnMode(app.signOnMode) }}</p>
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
            <h2 class="text-lg font-semibold text-secondary-900">Group Analysis</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ groupMembers.length }}</div>
                <div class="text-sm text-secondary-500">Total Members</div>
                <div class="text-xs text-secondary-400 mt-1">Users who are members of this group</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">{{ groupApps.length }}</div>
                <div class="text-sm text-secondary-500">Applications</div>
                <div class="text-xs text-secondary-400 mt-1">Applications accessible through this group</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{{ accessPaths }}</div>
                <div class="text-sm text-secondary-500">Access Paths</div>
                <div class="text-xs text-secondary-400 mt-1">Total user-to-app access paths via this group</div>
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
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import type { Group, User, Application } from '~/lib/okta/types'

// Get route params
const route = useRoute()
const groupId = route.params.id as string

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const group = ref<Group | null>(null)

// Mock data for members and apps - in real app these would come from API
const groupMembers = ref<User[]>([])
const groupApps = ref<Application[]>([])

// Access analysis computed properties
const accessPaths = computed(() => {
  return groupMembers.value.length * groupApps.value.length
})

// Methods
function getTypeColor(type: string): string {
  const colors = {
    OKTA_GROUP: 'bg-blue-100 text-blue-800',
    APP_GROUP: 'bg-purple-100 text-purple-800',
    BUILT_IN: 'bg-gray-100 text-gray-800'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function formatGroupType(type: string): string {
  const types = {
    OKTA_GROUP: 'Okta Group',
    APP_GROUP: 'App Group',
    BUILT_IN: 'Built-in'
  }
  return types[type as keyof typeof types] || type
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

async function refreshGroup() {
  isLoading.value = true
  error.value = null

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock group data
    group.value = {
      id: groupId,
      type: 'OKTA_GROUP',
      created: '2023-01-15T10:00:00Z',
      lastUpdated: '2024-06-08T09:30:00Z',
      profile: {
        name: 'Engineering Team',
        description: 'Software engineers and developers'
      }
    }

    // Mock members data
    groupMembers.value = [
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
      } as any,
      {
        id: '3',
        status: 'ACTIVE',
        created: '2023-03-10T11:00:00Z',
        lastLogin: '2024-06-08T08:15:00Z',
        lastUpdated: '2024-06-08T08:15:00Z',
        profile: {
          firstName: 'Mike',
          lastName: 'Wilson',
          email: 'mike.wilson@company.com',
          login: 'mike.wilson@company.com'
        }
      } as any
    ]

    // Mock apps data
    groupApps.value = [
      {
        id: '1',
        name: 'github-app',
        label: 'GitHub Enterprise',
        status: 'ACTIVE',
        signOnMode: 'SAML_2_0',
        created: '2023-01-15T10:00:00Z',
        lastUpdated: '2024-06-08T09:30:00Z'
      },
      {
        id: '2',
        name: 'jira-app',
        label: 'Jira Software',
        status: 'ACTIVE',
        signOnMode: 'OPENID_CONNECT',
        created: '2023-02-20T14:00:00Z',
        lastUpdated: '2024-06-07T16:45:00Z'
      }
    ]

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load group'
    console.error('Error loading group:', err)
  } finally {
    isLoading.value = false
  }
}

async function refreshMembers() {
  // In real app, this would refresh group members
  await refreshGroup()
}

async function refreshApps() {
  // In real app, this would refresh group applications
  await refreshGroup()
}

function viewAccessGraph() {
  if (group.value) {
    navigateTo(`/graph?group=${encodeURIComponent(group.value.profile.name)}`)
  }
}

function viewMemberDetails(member: User) {
  navigateTo(`/users/${member.id}`)
}

function viewAppDetails(app: Application) {
  navigateTo(`/applications/${app.id}`)
}

// Lifecycle
onMounted(async () => {
  if (groupId) {
    await refreshGroup()
  }
})

// SEO
useHead({
  title: computed(() => {
    if (group.value) {
      return `${group.value.profile.name} - Groups - oudit`
    }
    return 'Group Details - oudit'
  }),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        if (group.value) {
          return `View detailed information for ${group.value.profile.name} including members, applications, and access analysis`
        }
        return 'View detailed group information including members, applications, and access analysis'
      })
    }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
