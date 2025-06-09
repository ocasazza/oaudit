<template>
  <div class="bg-white shadow-sm border border-secondary-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-secondary-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-secondary-900">Access Relationship Graph</h3>
          <p class="text-sm text-secondary-500">
            Visual representation of user access paths and relationships
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="resetZoom"
            class="px-3 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 hover:bg-secondary-200 transition-colors"
          >
            Reset Zoom
          </button>
          <button
            @click="toggleLayout"
            class="px-3 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 hover:bg-secondary-200 transition-colors"
          >
            {{ layoutType === 'force' ? 'Hierarchical' : 'Force' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Graph Container -->
    <div class="relative">
      <div
        ref="graphContainer"
        class="w-full h-96 overflow-hidden"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <svg
          ref="svgElement"
          class="w-full h-full"
          :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
        >
          <!-- Definitions for arrowheads -->
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
          </defs>

          <!-- Edges -->
          <g class="edges">
            <line
              v-for="edge in graphData.edges"
              :key="edge.id"
              :x1="getNodePosition(edge.source).x"
              :y1="getNodePosition(edge.source).y"
              :x2="getNodePosition(edge.target).x"
              :y2="getNodePosition(edge.target).y"
              :stroke="edge.color || '#6B7280'"
              stroke-width="2"
              marker-end="url(#arrowhead)"
              class="transition-all duration-300"
              :class="{ 'opacity-30': highlightedPath && !isEdgeInPath(edge) }"
            />
          </g>

          <!-- Nodes -->
          <g class="nodes">
            <g
              v-for="node in graphData.nodes"
              :key="node.id"
              :transform="`translate(${node.x || 0}, ${node.y || 0})`"
              class="cursor-pointer transition-all duration-300"
              :class="{ 'opacity-50': highlightedPath && !isNodeInPath(node) }"
              @click="selectNode(node)"
              @mouseenter="showTooltip(node, $event)"
              @mouseleave="hideTooltip"
            >
              <!-- Node circle -->
              <circle
                :r="node.size || 20"
                :fill="node.color || getNodeColor(node.type)"
                :stroke="selectedNode?.id === node.id ? '#1F2937' : 'white'"
                :stroke-width="selectedNode?.id === node.id ? 3 : 2"
                class="transition-all duration-200"
              />

              <!-- Node icon -->
              <text
                :font-size="(node.size || 20) * 0.6"
                text-anchor="middle"
                dominant-baseline="central"
                fill="white"
                class="pointer-events-none select-none"
              >
                {{ getNodeIcon(node.type) }}
              </text>

              <!-- Node label -->
              <text
                :y="(node.size || 20) + 15"
                text-anchor="middle"
                :font-size="12"
                fill="#374151"
                class="pointer-events-none select-none font-medium"
              >
                {{ truncateLabel(node.label) }}
              </text>
            </g>
          </g>
        </svg>

        <!-- Tooltip -->
        <div
          v-if="tooltip.visible"
          :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px'
          }"
          class="absolute z-10 bg-gray-900 text-white text-xs px-3 py-2 pointer-events-none shadow-lg"
        >
          <div class="font-semibold">{{ tooltip.node?.label }}</div>
          <div class="text-gray-300">{{ tooltip.node?.type }}</div>
          <div v-if="tooltip.node?.data" class="text-gray-400 mt-1">
            {{ getNodeDetails(tooltip.node) }}
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
      >
        <div class="flex items-center space-x-2">
          <ArrowPathIcon class="h-5 w-5 animate-spin text-primary-600" />
          <span class="text-sm text-secondary-600">Loading graph...</span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-500"></div>
            <span class="text-xs text-secondary-600">Users</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-green-500"></div>
            <span class="text-xs text-secondary-600">Groups</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-orange-500"></div>
            <span class="text-xs text-secondary-600">Rules</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-purple-500"></div>
            <span class="text-xs text-secondary-600">Applications</span>
          </div>
        </div>
        <div class="text-xs text-secondary-500">
          {{ graphData.nodes.length }} nodes, {{ graphData.edges.length }} connections
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import type { GraphData, GraphNode, GraphEdge } from '~/lib/okta/types'

interface Props {
  graphData: GraphData
  loading?: boolean
  highlightPath?: string[] // Array of node IDs to highlight
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Reactive state
const graphContainer = ref<HTMLElement>()
const svgElement = ref<SVGElement>()
const selectedNode = ref<GraphNode | null>(null)
const layoutType = ref<'force' | 'hierarchical'>('force')
const viewBox = ref({ x: 0, y: 0, width: 800, height: 400 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  node: null as GraphNode | null
})

// Computed properties
const highlightedPath = computed(() => props.highlightPath)

// Node color mapping
const nodeColors = {
  user: '#3B82F6',     // Blue
  group: '#10B981',    // Green
  rule: '#F59E0B',     // Orange
  application: '#8B5CF6' // Purple
}

// Node icon mapping
const nodeIcons = {
  user: '👤',
  group: '👥',
  rule: '⚙️',
  application: '📱'
}

// Methods
function getNodeColor(type: string): string {
  return nodeColors[type as keyof typeof nodeColors] || '#6B7280'
}

function getNodeIcon(type: string): string {
  return nodeIcons[type as keyof typeof nodeIcons] || '●'
}

function getNodePosition(nodeId: string): { x: number; y: number } {
  const node = props.graphData.nodes.find(n => n.id === nodeId)
  return { x: node?.x || 0, y: node?.y || 0 }
}

function truncateLabel(label: string, maxLength: number = 15): string {
  return label.length > maxLength ? label.substring(0, maxLength) + '...' : label
}

function getNodeDetails(node: GraphNode): string {
  if (node.type === 'user' && node.data) {
    const user = node.data as any
    return user.profile?.email || user.profile?.login || ''
  }
  if (node.type === 'application' && node.data) {
    const app = node.data as any
    return app.status || ''
  }
  if (node.type === 'group' && node.data) {
    const group = node.data as any
    return group.profile?.description || ''
  }
  return ''
}

function isNodeInPath(node: GraphNode): boolean {
  return !highlightedPath.value || highlightedPath.value.includes(node.id)
}

function isEdgeInPath(edge: GraphEdge): boolean {
  return !highlightedPath.value ||
    (highlightedPath.value.includes(edge.source) && highlightedPath.value.includes(edge.target))
}

function selectNode(node: GraphNode) {
  selectedNode.value = selectedNode.value?.id === node.id ? null : node
  // Emit event for parent component
  emit('nodeSelected', node)
}

function showTooltip(node: GraphNode, event: MouseEvent) {
  const rect = graphContainer.value?.getBoundingClientRect()
  if (rect) {
    tooltip.value = {
      visible: true,
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top - 10,
      node
    }
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function resetZoom() {
  viewBox.value = { x: 0, y: 0, width: 800, height: 400 }
}

function toggleLayout() {
  layoutType.value = layoutType.value === 'force' ? 'hierarchical' : 'force'
  layoutNodes()
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9
  const centerX = viewBox.value.x + viewBox.value.width / 2
  const centerY = viewBox.value.y + viewBox.value.height / 2

  viewBox.value.width *= scaleFactor
  viewBox.value.height *= scaleFactor
  viewBox.value.x = centerX - viewBox.value.width / 2
  viewBox.value.y = centerY - viewBox.value.height / 2
}

function handleMouseDown(event: MouseEvent) {
  isDragging.value = true
  dragStart.value = { x: event.clientX, y: event.clientY }
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value) {
    const dx = event.clientX - dragStart.value.x
    const dy = event.clientY - dragStart.value.y

    viewBox.value.x -= dx
    viewBox.value.y -= dy

    dragStart.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseUp() {
  isDragging.value = false
}

function layoutNodes() {
  const nodes = [...props.graphData.nodes]
  const edges = props.graphData.edges

  if (layoutType.value === 'hierarchical') {
    // Simple hierarchical layout
    const levels: { [key: string]: GraphNode[] } = {}

    // Group nodes by type for hierarchical layout
    nodes.forEach(node => {
      const level = node.type
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })

    const levelOrder = ['user', 'rule', 'group', 'application']
    let y = 50

    levelOrder.forEach(levelType => {
      if (levels[levelType]) {
        const levelNodes = levels[levelType]
        const spacing = 600 / (levelNodes.length + 1)

        levelNodes.forEach((node, index) => {
          node.x = spacing * (index + 1)
          node.y = y
        })

        y += 100
      }
    })
  } else {
    // Simple force-directed layout simulation
    const centerX = 400
    const centerY = 200
    const radius = 150

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
    })
  }
}

// Emits
const emit = defineEmits<{
  nodeSelected: [node: GraphNode]
}>()

// Watchers
watch(() => props.graphData, () => {
  nextTick(() => {
    layoutNodes()
  })
}, { immediate: true })

// Lifecycle
onMounted(() => {
  layoutNodes()
})
</script>

<style scoped>
.edges line {
  transition: opacity 0.3s ease;
}

.nodes g {
  transition: opacity 0.3s ease;
}

svg {
  cursor: grab;
}

svg:active {
  cursor: grabbing;
}
</style>
