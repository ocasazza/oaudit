import { defineStore } from 'pinia'
import type { Application, ApplicationFilters } from '~/lib/okta/types'
import { getAllApplications, getApplication, getAppUsers, getAppGroups } from '~/lib/okta/apps'

export interface ApplicationState {
  applications: Application[]
  selectedApplication: Application | null
  loading: boolean
  error: string | null
  filters: ApplicationFilters
  searchQuery: string
  pagination: {
    currentPage: number
    pageSize: number
    total: number
  }
}

export const useApplicationsStore = defineStore('applications', {
  state: (): ApplicationState => ({
    applications: [],
    selectedApplication: null,
    loading: false,
    error: null,
    filters: {},
    searchQuery: '',
    pagination: {
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  }),

  getters: {
    filteredApplications: (state) => {
      let filtered = state.applications

      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(app =>
          app.label.toLowerCase().includes(query) ||
          app.name.toLowerCase().includes(query) ||
          app.signOnMode?.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (state.filters.status) {
        filtered = filtered.filter(app => app.status === state.filters.status)
      }

      // Apply sign-on mode filter
      if (state.filters.signOnMode) {
        filtered = filtered.filter(app => app.signOnMode === state.filters.signOnMode)
      }

      return filtered
    },

    paginatedApplications: (state) => {
      const filtered = (state as any).filteredApplications
      const start = (state.pagination.currentPage - 1) * state.pagination.pageSize
      const end = start + state.pagination.pageSize
      return filtered.slice(start, end)
    },

    totalPages: (state) => {
      const filtered = (state as any).filteredApplications
      return Math.ceil(filtered.length / state.pagination.pageSize)
    },

    applicationStats: (state) => {
      const apps = state.applications
      return {
        total: apps.length,
        active: apps.filter(a => a.status === 'ACTIVE').length,
        inactive: apps.filter(a => a.status === 'INACTIVE').length,
        bySignOnMode: apps.reduce((acc, app) => {
          const mode = app.signOnMode || 'Unknown'
          acc[mode] = (acc[mode] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }
  },

  actions: {
    async fetchApplications(filters?: ApplicationFilters) {
      this.loading = true
      this.error = null

      try {
        const applications = await getAllApplications(filters)
        this.applications = applications
        this.pagination.total = applications.length

        // Reset to first page if current page is beyond available pages
        const totalPages = Math.ceil(applications.length / this.pagination.pageSize)
        if (this.pagination.currentPage > totalPages && totalPages > 0) {
          this.pagination.currentPage = 1
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch applications'
        console.error('Error fetching applications:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchApplication(appId: string) {
      this.loading = true
      this.error = null

      try {
        const application = await getApplication(appId)
        this.selectedApplication = application

        // Update application in the list if it exists
        const index = this.applications.findIndex(a => a.id === appId)
        if (index !== -1) {
          this.applications[index] = application
        }

        return application
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch application'
        console.error('Error fetching application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchApplicationDetails(appId: string) {
      this.loading = true
      this.error = null

      try {
        const [application, users, groups] = await Promise.all([
          getApplication(appId),
          getAppUsers(appId),
          getAppGroups(appId)
        ])

        const appWithDetails = {
          ...application,
          users,
          groups
        }

        this.selectedApplication = appWithDetails as any
        return appWithDetails
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch application details'
        console.error('Error fetching application details:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
      this.pagination.currentPage = 1 // Reset to first page
    },

    setFilters(filters: Partial<ApplicationFilters>) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.currentPage = 1 // Reset to first page
    },

    clearFilters() {
      this.filters = {}
      this.searchQuery = ''
      this.pagination.currentPage = 1
    },

    setPage(page: number) {
      this.pagination.currentPage = page
    },

    setPageSize(size: number) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1 // Reset to first page
    },

    selectApplication(application: Application | null) {
      this.selectedApplication = application
    },

    clearError() {
      this.error = null
    }
  }
})
