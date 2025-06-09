<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-900 mb-2">
          Access Logs
        </h1>
        <p class="text-secondary-600 text-lg">
          Monitor and audit Okta access events and security activities
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow-sm border border-secondary-200 p-6 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Search -->
          <div class="flex-1 max-w-md">
            <label for="log-search" class="block text-sm font-medium text-secondary-700 mb-1">
              Search Logs
            </label>
            <div class="relative">
              <input
                id="log-search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by user, application, or event..."
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
              <label for="event-type-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Event Type
              </label>
              <select
                id="event-type-filter"
                v-model="filters.eventType"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="applyFilters"
              >
                <option value="">All Events</option>
                <option value="user.session.start">Login</option>
                <option value="user.session.end">Logout</option>
                <option value="app.generic.provision.assign_user_to_app">App Assignment</option>
                <option value="group.user_membership.add">Group Assignment</option>
                <option value="user.authentication.auth_via_mfa">MFA Authentication</option>
                <option value="security.threat.detected">Security Alert</option>
              </select>
            </div>
            <div>
              <label for="severity-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Severity
              </label>
              <select
                id="severity-filter"
                v-model="filters.severity"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="applyFilters"
              >
                <option value="">All Levels</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warning</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
            <div>
              <label for="time-filter" class="block text-sm font-medium text-secondary-700 mb-1">
                Time Range
              </label>
              <select
                id="time-filter"
                v-model="filters.timeRange"
                class="block w-full pl-3 pr-10 py-2 text-base border border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                @change="applyFilters"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              @click="refreshLogs"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
              Refresh
            </button>
            <button
              @click="exportLogs"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Event Detail Modal -->
      <div v-if="selectedEvent" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeEventDetail">
        <div class="bg-white shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden" @click.stop>
          <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">Event Details</h3>
              <button
                @click="closeEventDetail"
                class="text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="p-6 overflow-y-auto max-h-80">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">Event Type</label>
                <p class="text-sm text-secondary-900">{{ selectedEvent.eventType }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">Description</label>
                <p class="text-sm text-secondary-900">{{ selectedEvent.displayMessage }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">User</label>
                <p class="text-sm text-secondary-900">{{ selectedEvent.actor?.displayName || 'System' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">Application</label>
                <p class="text-sm text-secondary-900">{{ selectedEvent.target?.displayName || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">Timestamp</label>
                <p class="text-sm text-secondary-900">{{ formatFullDate(selectedEvent.published) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">Client IP</label>
                <p class="text-sm text-secondary-900">{{ selectedEvent.client?.ipAddress || 'Unknown' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">User Agent</label>
                <p class="text-sm text-secondary-900 break-all">{{ selectedEvent.client?.userAgent || 'Unknown' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-500 mb-1">Outcome</label>
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getOutcomeColor(selectedEvent.outcome?.result)
                ]">
                  {{ selectedEvent.outcome?.result || 'Unknown' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white shadow-sm border border-secondary-200 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-secondary-900">
              Access Events ({{ filteredLogs.length }})
            </h2>
            <div class="text-sm text-secondary-500">
              {{ isLoading ? 'Loading...' : `Showing ${filteredLogs.length} events` }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center">
          <ArrowPathIcon class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-secondary-600">Loading access logs...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredLogs.length === 0" class="p-8 text-center">
          <DocumentTextIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-secondary-900 mb-2">No events found</h3>
          <p class="text-secondary-500">
            {{ searchQuery ? 'Try adjusting your search or filters.' : 'No access events available.' }}
          </p>
        </div>

        <!-- Logs Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Event
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Application
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr
                v-for="log in paginatedLogs"
                :key="log.uuid"
                class="hover:bg-secondary-50 transition-colors cursor-pointer"
                @click="viewEventDetails(log)"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {{ formatTime(log.published) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-secondary-900">
                      {{ formatEventType(log.eventType) }}
                    </div>
                    <div class="text-sm text-secondary-500 truncate max-w-xs">
                      {{ log.displayMessage }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {{ log.actor?.displayName || 'System' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {{ log.target?.displayName || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getOutcomeColor(log.outcome?.result)
                  ]">
                    {{ log.outcome?.result || 'Unknown' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {{ log.client?.ipAddress || 'Unknown' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click.stop="viewEventDetails(log)"
                    class="text-primary-600 hover:text-primary-900 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredLogs.length > pageSize" class="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-secondary-700">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredLogs.length) }} of {{ filteredLogs.length }} events
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
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import type { LogEvent } from '~/lib/okta/types'

// Reactive state
const isLoading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 50
const selectedEvent = ref<LogEvent | null>(null)

const filters = ref({
  eventType: '',
  severity: '',
  timeRange: '24h'
})

// Mock logs data
const logs = ref<LogEvent[]>([
  {
    uuid: '1',
    published: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    eventType: 'user.session.start',
    version: '0',
    severity: 'INFO',
    displayMessage: 'User login successful',
    actor: {
      id: 'user1',
      type: 'User',
      alternateId: 'john.doe@company.com',
      displayName: 'John Doe'
    },
    target: {
      id: 'app1',
      type: 'AppInstance',
      alternateId: 'Salesforce',
      displayName: 'Salesforce'
    },
    client: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    outcome: {
      result: 'SUCCESS'
    }
  },
  {
    uuid: '2',
    published: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    eventType: 'user.authentication.auth_via_mfa',
    version: '0',
    severity: 'INFO',
    displayMessage: 'User authenticated via MFA',
    actor: {
      id: 'user2',
      type: 'User',
      alternateId: 'jane.smith@company.com',
      displayName: 'Jane Smith'
    },
    client: {
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    outcome: {
      result: 'SUCCESS'
    }
  },
  {
    uuid: '3',
    published: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    eventType: 'user.session.start',
    version: '0',
    severity: 'WARN',
    displayMessage: 'Failed login attempt',
    actor: {
      id: 'user3',
      type: 'User',
      alternateId: 'mike.wilson@company.com',
      displayName: 'Mike Wilson'
    },
    target: {
      id: 'app2',
      type: 'AppInstance',
      alternateId: 'GitHub',
      displayName: 'GitHub Enterprise'
    },
    client: {
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    },
    outcome: {
      result: 'FAILURE'
    }
  },
  {
    uuid: '4',
    published: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    eventType: 'app.generic.provision.assign_user_to_app',
    version: '0',
    severity: 'INFO',
    displayMessage: 'User assigned to application',
    actor: {
      id: 'admin1',
      type: 'User',
      alternateId: 'admin@company.com',
      displayName: 'System Admin'
    },
    target: {
      id: 'app3',
      type: 'AppInstance',
      alternateId: 'Jira',
      displayName: 'Jira Software'
    },
    client: {
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    outcome: {
      result: 'SUCCESS'
    }
  },
  {
    uuid: '5',
    published: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    eventType: 'security.threat.detected',
    version: '0',
    severity: 'ERROR',
    displayMessage: 'Suspicious login activity detected',
    actor: {
      id: 'user4',
      type: 'User',
      alternateId: 'suspicious@external.com',
      displayName: 'Unknown User'
    },
    client: {
      ipAddress: '203.0.113.1',
      userAgent: 'curl/7.68.0'
    },
    outcome: {
      result: 'FAILURE'
    }
  }
])

// Computed properties
const filteredLogs = computed(() => {
  let filtered = logs.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log =>
      log.displayMessage.toLowerCase().includes(query) ||
      log.actor?.displayName?.toLowerCase().includes(query) ||
      log.target?.displayName?.toLowerCase().includes(query) ||
      log.eventType.toLowerCase().includes(query)
    )
  }

  // Apply event type filter
  if (filters.value.eventType) {
    filtered = filtered.filter(log => log.eventType === filters.value.eventType)
  }

  // Apply severity filter
  if (filters.value.severity) {
    filtered = filtered.filter(log => log.severity === filters.value.severity)
  }

  // Apply time range filter
  const now = new Date()
  const timeRangeMs = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  }

  const rangeMs = timeRangeMs[filters.value.timeRange as keyof typeof timeRangeMs]
  if (rangeMs) {
    const cutoff = new Date(now.getTime() - rangeMs)
    filtered = filtered.filter(log => new Date(log.published) >= cutoff)
  }

  return filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredLogs.value.slice(start, end)
})

// Methods
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  return date.toLocaleDateString()
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function formatEventType(eventType: string): string {
  const types: Record<string, string> = {
    'user.session.start': 'User Login',
    'user.session.end': 'User Logout',
    'app.generic.provision.assign_user_to_app': 'App Assignment',
    'group.user_membership.add': 'Group Assignment',
    'user.authentication.auth_via_mfa': 'MFA Authentication',
    'security.threat.detected': 'Security Alert'
  }

  return types[eventType] || eventType
}

function getOutcomeColor(outcome?: string): string {
  const colors = {
    SUCCESS: 'bg-green-100 text-green-800',
    FAILURE: 'bg-red-100 text-red-800',
    SKIPPED: 'bg-yellow-100 text-yellow-800'
  }
  return colors[outcome as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function viewEventDetails(event: LogEvent) {
  selectedEvent.value = event
}

function closeEventDetail() {
  selectedEvent.value = null
}

async function refreshLogs() {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In real app, fetch logs from Okta API
    // const fetchedLogs = await getSystemLogs(filters.value)
    // logs.value = fetchedLogs

  } catch (error) {
    console.error('Error refreshing logs:', error)
  } finally {
    isLoading.value = false
  }
}

function exportLogs() {
  // In real app, this would export logs to CSV/JSON
  const dataStr = JSON.stringify(filteredLogs.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `okta-logs-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
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
watch(() => filteredLogs.value.length, () => {
  // Reset to first page if current page is beyond available pages
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
})

// Lifecycle
onMounted(() => {
  // Check for URL parameters
  const route = useRoute()
  if (route.query.event) {
    // Find and show specific event
    const eventId = route.query.event as string
    const event = logs.value.find(log => log.uuid === eventId)
    if (event) {
      selectedEvent.value = event
    }
  }
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }

  // Load initial data
  refreshLogs()
})

// SEO
useHead({
  title: 'Access Logs - oudit',
  meta: [
    { name: 'description', content: 'Monitor and audit Okta access events and security activities' }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
