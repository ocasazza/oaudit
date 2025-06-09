<template>
  <div class="bg-gradient-to-br from-primary-50 to-secondary-100 transition-colors duration-300 min-h-full">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-900 mb-2">
          Access Relationship Graph
        </h1>
        <p class="text-secondary-600 text-lg">
          Visualize complex access chains and relationships between users, groups, rules, and applications
        </p>
      </div>

      <!-- Controls Section -->
      <div class="bg-white shadow-sm border border-secondary-200 p-6 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Search Controls -->
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div class="flex-1 min-w-0">
              <label for="user-search" class="block text-sm font-medium text-secondary-700 mb-1">
                Search User
              </label>
              <div class="relative">
                <input
                  id="user-search"
                  v-model="searchQuery.user"
                  type="text"
                  placeholder="Enter username or email..."
                  class="block w-full pl-10 pr-3 py-2 border border-secondary-300 leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  @keyup.enter="searchUser"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon class="h-5 w-5 text-secondary-400" />
                </div>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <label for="app-search" class="block text-sm font-medium text-secondary-700 mb-1">
                Search Application
              </label>
              <div class="relative">
                <input
                  id="app-search"
                  v-model="searchQuery.application"
                  type="text"
                  placeholder="Enter application name..."
                  class="block w-full pl-10 pr-3 py-2 border border-secondary-300 leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  @keyup.enter="searchApplication"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon class="h-5 w-5 text-secondary-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button
              @click="loadUserGraph"
              :disabled="!searchQuery.user || isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShareIcon class="h-4 w-4 mr-2" />
              Load User Graph
            </button>
            <button
              @click="traceAccess"
              :disabled="!searchQuery.user || !searchQuery.application || isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
              Trace Access
            </button>
            <button
              @click="clearGraph"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XMarkIcon class="h-4 w-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Graph Visualization -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <!-- Main Graph -->
        <div class="xl:col-span-3">
          <AccessGraph
            :graph-data="graphData"
            :loading="isLoading"
            :highlight-path="highlightedPath"
            @node-selected="handleNodeSelected"
          />
        </div>

        <!-- Side Panel -->
        <div class="space-y-6">
          <!-- Selected Node Details -->
          <div v-if="selectedNode" class="bg-white shadow-sm border border-secondary-200 p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Node Details</h3>
            <div class="space-y-3">
              <div>
                <span class="text-sm font-medium text-secondary-500">Type:</span>
                <span class="ml-2 text-sm text-secondary-900 capitalize">{{ selectedNode.type }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-secondary-500">Name:</span>
                <span class="ml-2 text-sm text-secondary-900">{{ selectedNode.label }}</span>
              </div>
              <div v-if="getNodeDetails(selectedNode)">
                <span class="text-sm font-medium text-secondary-500">Details:</span>
                <span class="ml-2 text-sm text-secondary-900">{{ getNodeDetails(selectedNode) }}</span>
              </div>
            </div>

            <!-- Actions for selected node -->
            <div class="mt-4 space-y-2">
              <button
                v-if="selectedNode.type === 'user'"
                @click="loadUserGraph(selectedNode.label)"
                class="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
              >
                View Full Access Graph
              </button>
              <button
                v-if="selectedNode.type === 'application'"
                @click="viewApplicationUsers(selectedNode.label)"
                class="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
              >
                View All Users
              </button>
              <button
                v-if="selectedNode.type === 'group'"
                @click="viewGroupMembers(selectedNode.label)"
                class="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
              >
                View Group Members
              </button>
            </div>
          </div>

          <!-- Access Path -->
          <div v-if="accessChain" class="bg-white shadow-sm border border-secondary-200 p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Access Path</h3>
            <div class="space-y-3">
              <div
                v-for="(step, index) in accessChain.path"
                :key="step.id"
                class="flex items-center space-x-3"
              >
                <div class="flex-shrink-0">
                  <div :class="[
                    'w-8 h-8 flex items-center justify-center text-white text-xs font-medium',
                    getStepColor(step.type)
                  ]">
                    {{ index + 1 }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-secondary-900">{{ step.name }}</p>
                  <p class="text-xs text-secondary-500">{{ step.reason }}</p>
                  <p v-if="step.humanReadableReason" class="text-xs text-secondary-400 italic">
                    {{ step.humanReadableReason }}
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-secondary-200">
              <div class="text-sm text-secondary-600">
                <span class="font-medium">Total hops:</span> {{ accessChain.totalHops }}
              </div>
            </div>
          </div>

          <!-- Graph Statistics -->
          <div class="bg-white shadow-sm border border-secondary-200 p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Graph Statistics</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-secondary-500">Total Nodes:</span>
                <span class="text-sm font-medium text-secondary-900">{{ graphData.nodes.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-500">Connections:</span>
                <span class="text-sm font-medium text-secondary-900">{{ graphData.edges.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-500">Users:</span>
                <span class="text-sm font-medium text-secondary-900">
                  {{ graphData.nodes.filter(n => n.type === 'user').length }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-500">Groups:</span>
                <span class="text-sm font-medium text-secondary-900">
                  {{ graphData.nodes.filter(n => n.type === 'group').length }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-500">Applications:</span>
                <span class="text-sm font-medium text-secondary-900">
                  {{ graphData.nodes.filter(n => n.type === 'application').length }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-500">Rules:</span>
                <span class="text-sm font-medium text-secondary-900">
                  {{ graphData.nodes.filter(n => n.type === 'rule').length }}
                </span>
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
  UserIcon,
  BuildingOfficeIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import AccessGraph from '~/components/AccessGraph.vue'
import type { GraphData, GraphNode, AccessChain } from '~/lib/okta/types'
import { useAccessStore } from '~/stores/access'

// Use Pinia store
const accessStore = useAccessStore()

// Reactive state
const isLoading = computed(() => accessStore.loading)
const selectedNode = computed(() => accessStore.selectedNode)
const accessChain = computed(() => accessStore.currentChain)
const highlightedPath = computed(() => accessStore.highlightedPath)
const graphData = computed(() => accessStore.currentGraph)

const searchQuery = ref({
  user: '',
  application: ''
})

// Methods
async function loadUserGraph(userName?: string) {
  const user = userName || searchQuery.value.user
  if (!user) return

  // Use the store action to load the graph
  await accessStore.loadUserGraph(user)
}

async function traceAccess() {
  if (!searchQuery.value.user || !searchQuery.value.application) return

  // Use the store action to trace access
  await accessStore.traceAccess(searchQuery.value.user, searchQuery.value.application)
}

function clearGraph() {
  accessStore.clearAll()
  searchQuery.value = { user: '', application: '' }
}

function handleNodeSelected(node: GraphNode) {
  accessStore.selectNode(node)
}

function getNodeDetails(node: GraphNode): string {
  if (node.type === 'user' && node.data) {
    const user = node.data as any
    return user.profile?.email || ''
  }
  if (node.type === 'application' && node.data) {
    const app = node.data as any
    return `Status: ${app.status || 'Unknown'}`
  }
  if (node.type === 'group' && node.data) {
    const group = node.data as any
    return group.profile?.description || ''
  }
  if (node.type === 'rule' && node.data) {
    const rule = node.data as any
    return rule.name || ''
  }
  return ''
}

function getStepColor(type: string): string {
  const colors = {
    user: 'bg-blue-500',
    group: 'bg-green-500',
    rule: 'bg-orange-500',
    application: 'bg-purple-500'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}

function searchUser() {
  if (searchQuery.value.user) {
    loadUserGraph()
  }
}

function searchApplication() {
  // Could implement application-specific search here
}

function viewApplicationUsers(appName: string) {
  // Navigate to application users view
  navigateTo(`/applications?search=${encodeURIComponent(appName)}`)
}

function viewGroupMembers(groupName: string) {
  // Navigate to group members view
  navigateTo(`/groups?search=${encodeURIComponent(groupName)}`)
}

// Lifecycle
onMounted(() => {
  // Check for URL parameters
  const route = useRoute()
  if (route.query.user) {
    searchQuery.value.user = route.query.user as string
    loadUserGraph()
  }
})

// SEO
useHead({
  title: 'Access Graph - oudit',
  meta: [
    { name: 'description', content: 'Visualize Okta access relationships and trace user permissions' }
  ]
})
</script>

<style scoped>
/* Additional component-specific styles */
</style>
