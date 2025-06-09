<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-900 mb-2">
          Users
        </h1>
        <p class="text-secondary-600 text-lg">
          Manage and audit Okta user accounts and their access permissions
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow-sm border border-secondary-200 p-6 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Search -->
          <div class="flex-1 max-w-md">
            <label for="user-search" class="block text-sm font-medium text-secondary-700 mb-1">
              Search Users
            </label>
            <div class="relative">
              <input
                id="user-search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, email, or department..."
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
              <label for="status-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                :value="filters.status"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="updateStatusFilter"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="STAGED">Staged</option>
                <option value="PROVISIONED">Provisioned</option>
                <option value="RECOVERY">Recovery</option>
                <option value="DEPROVISIONED">Deprovisioned</option>
              </select>
            </div>
            <div>
              <label for="department-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Department
              </label>
              <select
                id="department-filter"
                :value="filters.department"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="updateDepartmentFilter"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              @click="refreshUsers"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-secondary-900">
              Users ({{ filteredUsers.length }})
            </h2>
            <div class="text-sm text-secondary-500">
              {{ isLoading ? 'Loading...' : `Showing ${filteredUsers.length} users` }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center">
          <ArrowPathIcon class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading users...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
          <UserIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-secondary-900 mb-2">No users found</h3>
          <p class="text-secondary-500">
            {{ searchQuery ? 'Try adjusting your search or filters.' : 'No users available.' }}
          </p>
        </div>

        <!-- Users Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Applications
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                v-for="user in paginatedUsers"
                :key="user.id"
                class="hover:bg-secondary-50 transition-colors cursor-pointer"
                @click="viewUserDetails(user)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 bg-primary-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary-700">
                          {{ getUserInitials(user) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-secondary-900">
                        {{ user.profile.firstName }} {{ user.profile.lastName }}
                      </div>
                      <div class="text-sm text-secondary-500">
                        {{ user.profile.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusColor(user.status)
                  ]">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {{ user.profile.department || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {{ formatLastLogin(user.lastLogin) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {{ (user as any).appCount || 0 }} apps
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click.stop="viewAccessGraph(user)"
                      class="text-primary-600 hover:text-primary-900 transition-colors"
                      title="View Access Graph"
                    >
                      <ShareIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="traceUserAccess(user)"
                      class="text-secondary-600 hover:text-secondary-900 transition-colors"
                      title="Trace Access"
                    >
                      <MagnifyingGlassIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredUsers.length > pageSize" class="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-secondary-700">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredUsers.length) }} of {{ filteredUsers.length }} users
            </div>
            <div class="flex space-x-2">
              <button
                @click="usersStore.setPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                @click="usersStore.setPage(currentPage + 1)"
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
import { computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'
import { useUsersStore } from '~/stores/users'
import type { User } from '~/lib/okta/types'

// Use Pinia store
const usersStore = useUsersStore()

// Computed properties from store
const isLoading = computed(() => usersStore.loading)
const filteredUsers = computed(() => usersStore.filteredUsers)
const paginatedUsers = computed(() => usersStore.paginatedUsers)
const totalPages = computed(() => usersStore.totalPages)
const currentPage = computed(() => usersStore.pagination.currentPage)
const pageSize = 20

// Local reactive state for form inputs
const searchQuery = computed({
  get: () => usersStore.searchQuery,
  set: (value: string) => usersStore.setSearchQuery(value)
})

const filters = computed(() => usersStore.filters)

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

function viewUserDetails(user: User) {
  // Navigate to user detail view
  navigateTo(`/users/${user.id}`)
}

function viewAccessGraph(user: User) {
  // Navigate to graph view with user pre-selected
  navigateTo(`/graph?user=${encodeURIComponent(user.profile.email)}`)
}

function traceUserAccess(user: User) {
  // Navigate to graph view
  navigateTo(`/graph?user=${encodeURIComponent(user.profile.email)}`)
}

async function refreshUsers() {
  await usersStore.fetchUsers()
}

function updateStatusFilter(event: Event) {
  const target = event.target as HTMLSelectElement
  usersStore.setFilters({ status: target.value })
}

function updateDepartmentFilter(event: Event) {
  const target = event.target as HTMLSelectElement
  usersStore.setFilters({ department: target.value })
}

// Debounced search
let searchTimeout: NodeJS.Timeout
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Search is handled by the computed property
  }, 300)
}

// Lifecycle
onMounted(async () => {
  // Check for URL parameters
  const route = useRoute()
  if (route.query.search) {
    usersStore.setSearchQuery(route.query.search as string)
  }
  if (route.query.filter) {
    usersStore.setFilters({ status: route.query.filter as string })
  }

  // Load initial data
  await refreshUsers()
})

// SEO
useHead({
  title: 'Users - oudit',
  meta: [
    { name: 'description', content: 'Manage and audit Okta user accounts and access permissions' }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
