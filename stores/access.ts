import { defineStore } from 'pinia'
import type { AccessChain, GraphData, GraphNode, AccessPathNode } from '~/lib/okta/types'
import {
  traceUserToApp,
  getAccessGraph,
  getAllUserAccessChains,
  getApplicationAccessChains,
  getAccessComplexityStats
} from '~/lib/okta/chains'

export interface AccessState {
  currentGraph: GraphData
  selectedNode: GraphNode | null
  accessChains: AccessChain[]
  currentChain: AccessChain | null
  highlightedPath: string[]
  loading: boolean
  error: string | null
  complexityStats: {
    totalApplications: number
    directAssignments: number
    groupBasedAssignments: number
    ruleBasedAssignments: number
    averageHopsToAccess: number
    mostComplexPath: AccessChain | null
  } | null
}

export const useAccessStore = defineStore('access', {
  state: (): AccessState => ({
    currentGraph: {
      nodes: [],
      edges: [],
      metadata: {
        centerNodeId: '',
        totalNodes: 0,
        totalEdges: 0,
        maxDepth: 0
      }
    },
    selectedNode: null,
    accessChains: [],
    currentChain: null,
    highlightedPath: [],
    loading: false,
    error: null,
    complexityStats: null
  }),

  getters: {
    graphStats: (state) => {
      const nodes = state.currentGraph.nodes
      return {
        totalNodes: nodes.length,
        totalEdges: state.currentGraph.edges.length,
        userCount: nodes.filter(n => n.type === 'user').length,
        groupCount: nodes.filter(n => n.type === 'group').length,
        applicationCount: nodes.filter(n => n.type === 'application').length,
        ruleCount: nodes.filter(n => n.type === 'rule').length
      }
    },

    hasGraph: (state) => state.currentGraph.nodes.length > 0,

    hasAccessChain: (state) => state.currentChain !== null,

    pathComplexity: (state) => {
      if (!state.currentChain) return 0
      return state.currentChain.totalHops
    }
  },

  actions: {
    async loadUserGraph(userId: string, maxDepth: number = 3) {
      this.loading = true
      this.error = null

      try {
        const graphData = await getAccessGraph(userId, maxDepth)
        this.currentGraph = graphData
        this.selectedNode = null
        this.highlightedPath = []
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load user graph'
        console.error('Error loading user graph:', error)
      } finally {
        this.loading = false
      }
    },

    async traceAccess(userId: string, appId: string) {
      this.loading = true
      this.error = null

      try {
        const accessChain = await traceUserToApp(userId, appId)
        this.currentChain = accessChain

        // Highlight the path in the graph
        this.highlightedPath = accessChain.path.map(node => node.id)

        return accessChain
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to trace access'
        console.error('Error tracing access:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadUserAccessChains(userId: string) {
      this.loading = true
      this.error = null

      try {
        const chains = await getAllUserAccessChains(userId)
        this.accessChains = chains
        return chains
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load user access chains'
        console.error('Error loading user access chains:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadApplicationAccessChains(appId: string) {
      this.loading = true
      this.error = null

      try {
        const chains = await getApplicationAccessChains(appId)
        this.accessChains = chains
        return chains
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load application access chains'
        console.error('Error loading application access chains:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadComplexityStats(userId: string) {
      this.loading = true
      this.error = null

      try {
        const stats = await getAccessComplexityStats(userId)
        this.complexityStats = stats
        return stats
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load complexity stats'
        console.error('Error loading complexity stats:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    selectNode(node: GraphNode | null) {
      this.selectedNode = node
    },

    setHighlightedPath(path: string[]) {
      this.highlightedPath = path
    },

    clearHighlight() {
      this.highlightedPath = []
    },

    clearGraph() {
      this.currentGraph = {
        nodes: [],
        edges: [],
        metadata: {
          centerNodeId: '',
          totalNodes: 0,
          totalEdges: 0,
          maxDepth: 0
        }
      }
      this.selectedNode = null
      this.highlightedPath = []
    },

    clearChain() {
      this.currentChain = null
      this.highlightedPath = []
    },

    clearAll() {
      this.clearGraph()
      this.clearChain()
      this.accessChains = []
      this.complexityStats = null
    },

    clearError() {
      this.error = null
    }
  }
})
