<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-900 mb-2">
          Groups
        </h1>
        <p class="text-secondary-600 text-lg">
          Manage and audit Okta groups and their member assignments
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow-sm border border-secondary-200 p-6 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Search -->
          <div class="flex-1 max-w-md">
            <label for="group-search" class="block text-sm font-medium text-secondary-700 mb-1">
              Search Groups
            </label>
            <div class="relative">
              <input
                id="group-search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or description..."
                class="block w-full pl-10 pr-3 py-2 border border-secondary-300 leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @input="debouncedSearch"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-secondary-400" />
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex space-x-4">
            <div>
              <label for="type-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Type
              </label>
              <select
                id="type-filter"
                v-model="filters.type"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="applyFilters"
              >
                <option value="">All Types</option>
                <option value="OKTA_GROUP">Okta Group</option>
                <option value="APP_GROUP">App Group</option>
                <option value="BUILT_IN">Built-in</option>
              </select>
            </div>
            <div>
              <label for="members-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Members
              </label>
              <select
                id="members-filter"
                v-model="filters.memberCount"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="applyFilters"
              >
                <option value="">All Groups</option>
                <option value="empty">Empty Groups</option>
                <option value="hasMembers">With Members</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              @click="refreshGroups"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Groups Table -->
      <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-secondary-900">
              Groups ({{ filteredGroups.length }})
            </h2>
            <div class="text-sm text-secondary-500">
              {{ isLoading ? 'Loading...' : `Showing ${filteredGroups.length} groups` }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center">
          <ArrowPathIcon class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading groups...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredGroups.length === 0" class="p-8 text-center">
          <UserGroupIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-secondary-900 mb-2">No groups found</h3>
          <p class="text-secondary-500">
            {{ searchQuery ? 'Try adjusting your search or filters.' : 'No groups available.' }}
          </p>
        </div>

        <!-- Groups Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Group
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Members
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Applications
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                v-for="group in paginatedGroups"
                :key="group.id"
                class="hover:bg-secondary-50 transition-colors cursor-pointer"
                @click="viewGroupDetails(group)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 bg-green-100 flex items-center justify-center">
                        <UserGroupIcon class="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-secondary-900">
                        {{ group.profile.name }}
                      </div>
                      <div class="text-sm text-secondary-500">
                        {{ group.profile.description || 'No description' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getTypeColor(group.type)
                  ]">
                    {{ formatGroupType(group.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  <div class="flex items-center">
                    <span class="font-medium">{{ (group as any).memberCount || 0 }}</span>
                    <span v-if="(group as any).memberCount === 0" class="ml-2 text-yellow-600">
                      <ExclamationTriangleIcon class="h-4 w-4" />
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {{ (group as any).appCount || 0 }} apps
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {{ formatDate(group.lastUpdated) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click.stop="viewGroupMembers(group)"
                      class="text-primary-600 hover:text-primary-900 transition-colors"
                      title="View Members"
                    >
                      <UserIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="viewGroupGraph(group)"
                      class="text-secondary-600 hover:text-secondary-900 transition-colors"
                      title="View Access Graph"
                    >
                      <ShareIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredGroups.length > pageSize" class="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-secondary-700">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredGroups.length) }} of {{ filteredGroups.length }} groups
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1 text-sm border border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserGroupIcon,
  UserIcon,
  ShareIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import type { Group } from '~/lib/okta/types'

// Mock group type
interface MockGroup extends Group {
  memberCount?: number
  appCount?: number
}

// Reactive state
const isLoading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 20

const filters = ref({
  type: '',
  memberCount: ''
})

// Mock groups data
const groups = ref<MockGroup[]>([
  {
    id: '1',
    type: 'OKTA_GROUP',
    created: '2023-01-15T10:00:00Z',
    lastUpdated: '2024-06-08T09:30:00Z',
    profile: {
      name: 'Engineering Team',
      description: 'Software engineers and developers'
    },
    memberCount: 25,
    appCount: 8
  },
  {
    id: '2',
    type: 'OKTA_GROUP',
    created: '2023-02-20T14:00:00Z',
    lastUpdated: '2024-06-07T16:45:00Z',
    profile: {
      name: 'Marketing Team',
      description: 'Marketing and communications team'
    },
    memberCount: 12,
    appCount: 5
  },
  {
    id: '3',
    type: 'APP_GROUP',
    created: '2023-03-10T11:00:00Z',
    lastUpdated: '2024-06-08T08:15:00Z',
    profile: {
      name: 'GitHub Admins',
      description: 'GitHub administrative access'
    },
    memberCount: 3,
    appCount: 1
  },
  {
    id: '4',
    type: 'OKTA_GROUP',
    created: '2024-06-01T09:00:00Z',
    lastUpdated: '2024-06-01T09:00:00Z',
    profile: {
      name: 'Contractors',
      description: 'External contractors and consultants'
    },
    memberCount: 0,
    appCount: 2
  },
  {
    id: '5',
    type: 'BUILT_IN',
    created: '2023-01-01T00:00:00Z',
    lastUpdated: '2024-06-06T17:20:00Z',
    profile: {
      name: 'Everyone',
      description: 'Built-in group for all users'
    },
    memberCount: 150,
    appCount: 12
  }
])

// Computed properties
const filteredGroups = computed(() => {
  let filtered = groups.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(group =>
      group.profile.name.toLowerCase().includes(query) ||
      group.profile.description?.toLowerCase().includes(query)
    )
  }

  // Apply type filter
  if (filters.value.type) {
    filtered = filtered.filter(group => group.type === filters.value.type)
  }

  // Apply member count filter
  if (filters.value.memberCount === 'empty') {
    filtered = filtered.filter(group => (group.memberCount || 0) === 0)
  } else if (filters.value.memberCount === 'hasMembers') {
    filtered = filtered.filter(group => (group.memberCount || 0) > 0)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredGroups.value.length / pageSize))

const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredGroups.value.slice(start, end)
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

function formatDate(dateString?: string): string {
  if (!dateString) return 'Unknown'

  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}

function viewGroupDetails(group: Group) {
  // Navigate to group detail view
  navigateTo(`/groups/${group.id}`)
}

function viewGroupMembers(group: Group) {
  // Navigate to users view filtered by this group
  navigateTo(`/users?group=${encodeURIComponent(group.profile.name)}`)
}

function viewGroupGraph(group: Group) {
  // Navigate to graph view with group pre-selected
  navigateTo(`/graph?group=${encodeURIComponent(group.profile.name)}`)
}

async function refreshGroups() {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In real app, fetch groups from Okta API
    // const fetchedGroups = await getAllGroups()
    // groups.value = fetchedGroups

  } catch (error) {
    console.error('Error refreshing groups:', error)
  } finally {
    isLoading.value = false
  }
}

function applyFilters() {
  currentPage.value = 1 // Reset to first page when filters change
}

// Debounced search
let searchTimeout: NodeJS.Timeout
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // Reset to first page when searching
  }, 300)
}

// Watchers
watch(() => filteredGroups.value.length, () => {
  // Reset to first page if current page is beyond available pages
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
})

// Lifecycle
onMounted(() => {
  // Check for URL parameters
  const route = useRoute()
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  if (route.query.filter) {
    filters.value.type = route.query.filter as string
  }

  // Load initial data
  refreshGroups()
})

// SEO
useHead({
  title: 'Groups - oudit',
  meta: [
    { name: 'description', content: 'Manage and audit Okta groups and their member assignments' }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
