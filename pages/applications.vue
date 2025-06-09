<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-900 mb-2">
          Applications
        </h1>
        <p class="text-secondary-600 text-lg">
          Manage and audit Okta applications and their user assignments
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow-sm border border-secondary-200 p-6 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Search -->
          <div class="flex-1 max-w-md">
            <label for="app-search" class="block text-sm font-medium text-secondary-700 mb-1">
              Search Applications
            </label>
            <div class="relative">
              <input
                id="app-search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, label, or sign-on mode..."
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
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label for="signon-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Sign-On Mode
              </label>
              <select
                id="signon-filter"
                :value="filters.signOnMode"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="updateSignOnModeFilter"
              >
                <option value="">All Modes</option>
                <option value="SAML_2_0">SAML 2.0</option>
                <option value="OPENID_CONNECT">OpenID Connect</option>
                <option value="SECURE_WEB_AUTHENTICATION">SWA</option>
                <option value="AUTO_LOGIN">Auto Login</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              @click="refreshApplications"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Applications Grid -->
      <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-secondary-900">
              Applications ({{ filteredApplications.length }})
            </h2>
            <div class="text-sm text-secondary-500">
              {{ isLoading ? 'Loading...' : `Showing ${filteredApplications.length} applications` }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center">
          <ArrowPathIcon class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading applications...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredApplications.length === 0" class="p-8 text-center">
          <BuildingOfficeIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-secondary-900 mb-2">No applications found</h3>
          <p class="text-secondary-500">
            {{ searchQuery ? 'Try adjusting your search or filters.' : 'No applications available.' }}
          </p>
        </div>

        <!-- Applications Grid -->
        <div v-else class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="app in paginatedApplications"
              :key="app.id"
              class="bg-white border border-secondary-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="viewApplicationDetails(app)"
            >
              <!-- App Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <span class="text-white font-semibold text-lg">
                        {{ getAppInitials(app) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-secondary-900 truncate">
                      {{ app.label }}
                    </h3>
                    <p class="text-sm text-secondary-500">
                      {{ app.name }}
                    </p>
                  </div>
                </div>
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getStatusColor(app.status)
                ]">
                  {{ app.status }}
                </span>
              </div>

              <!-- App Details -->
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-secondary-500">Sign-On Mode:</span>
                  <span class="text-secondary-900 font-medium">{{ formatSignOnMode(app.signOnMode) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-secondary-500">Users:</span>
                  <span class="text-secondary-900 font-medium">{{ (app as any).userCount || 0 }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-secondary-500">Groups:</span>
                  <span class="text-secondary-900 font-medium">{{ (app as any).groupCount || 0 }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-secondary-500">Last Updated:</span>
                  <span class="text-secondary-900">{{ formatDate(app.lastUpdated) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex space-x-2 pt-4 border-t border-secondary-200">
                <button
                  @click.stop="viewAppUsers(app)"
                  class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors"
                >
                  <UserIcon class="h-4 w-4 mr-1" />
                  Users
                </button>
                <button
                  @click.stop="viewAppGraph(app)"
                  class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors"
                >
                  <ShareIcon class="h-4 w-4 mr-1" />
                  Graph
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredApplications.length > pageSize" class="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-secondary-700">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredApplications.length) }} of {{ filteredApplications.length }} applications
            </div>
            <div class="flex space-x-2">
              <button
                @click="applicationsStore.setPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                @click="applicationsStore.setPage(currentPage + 1)"
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
  BuildingOfficeIcon,
  UserIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'
import { useApplicationsStore } from '~/stores/applications'
import type { Application } from '~/lib/okta/types'

// Use Pinia store
const applicationsStore = useApplicationsStore()

// Computed properties from store
const isLoading = computed(() => applicationsStore.loading)
const filteredApplications = computed(() => applicationsStore.filteredApplications)
const paginatedApplications = computed(() => applicationsStore.paginatedApplications)
const totalPages = computed(() => applicationsStore.totalPages)
const currentPage = computed(() => applicationsStore.pagination.currentPage)
const pageSize = 20

// Local reactive state for form inputs
const searchQuery = computed({
  get: () => applicationsStore.searchQuery,
  set: (value: string) => applicationsStore.setSearchQuery(value)
})

const filters = computed(() => applicationsStore.filters)

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
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}

function viewApplicationDetails(app: Application) {
  // Navigate to application detail view
  navigateTo(`/applications/${app.id}`)
}

function viewAppUsers(app: Application) {
  // Navigate to users view filtered by this application
  navigateTo(`/users?app=${encodeURIComponent(app.label)}`)
}

function viewAppGraph(app: Application) {
  // Navigate to graph view with application pre-selected
  navigateTo(`/graph?application=${encodeURIComponent(app.label)}`)
}

async function refreshApplications() {
  await applicationsStore.fetchApplications()
}

function updateStatusFilter(event: Event) {
  const target = event.target as HTMLSelectElement
  applicationsStore.setFilters({ status: target.value })
}

function updateSignOnModeFilter(event: Event) {
  const target = event.target as HTMLSelectElement
  applicationsStore.setFilters({ signOnMode: target.value })
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
    applicationsStore.setSearchQuery(route.query.search as string)
  }
  if (route.query.filter) {
    applicationsStore.setFilters({ status: route.query.filter as string })
  }

  // Load initial data
  await refreshApplications()
})

// SEO
useHead({
  title: 'Applications - oudit',
  meta: [
    { name: 'description', content: 'Manage and audit Okta applications and their user assignments' }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
