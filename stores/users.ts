import { defineStore } from 'pinia'
import type { User, UserFilters } from '~/lib/okta/types'
import { getAllUsers, getUser, getUserGroups, getUserApps } from '~/lib/okta/users'

export interface UserState {
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
  filters: UserFilters
  searchQuery: string
  pagination: {
    currentPage: number
    pageSize: number
    total: number
  }
}

export const useUsersStore = defineStore('users', {
  state: (): UserState => ({
    users: [],
    selectedUser: null,
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
    filteredUsers: (state) => {
      let filtered = state.users

      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(user =>
          user.profile.firstName?.toLowerCase().includes(query) ||
          user.profile.lastName?.toLowerCase().includes(query) ||
          user.profile.email.toLowerCase().includes(query) ||
          user.profile.department?.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (state.filters.status) {
        filtered = filtered.filter(user => user.status === state.filters.status)
      }

      // Apply department filter
      if (state.filters.department) {
        filtered = filtered.filter(user => user.profile.department === state.filters.department)
      }

      return filtered
    },

    paginatedUsers: (state) => {
      const filtered = (state as any).filteredUsers
      const start = (state.pagination.currentPage - 1) * state.pagination.pageSize
      const end = start + state.pagination.pageSize
      return filtered.slice(start, end)
    },

    totalPages: (state) => {
      const filtered = (state as any).filteredUsers
      return Math.ceil(filtered.length / state.pagination.pageSize)
    },

    userStats: (state) => {
      const users = state.users
      return {
        total: users.length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        inactive: users.filter(u => u.status !== 'ACTIVE').length,
        byDepartment: users.reduce((acc, user) => {
          const dept = user.profile.department || 'Unknown'
          acc[dept] = (acc[dept] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }
  },

  actions: {
    async fetchUsers(filters?: UserFilters) {
      this.loading = true
      this.error = null

      try {
        const users = await getAllUsers(filters)
        this.users = users
        this.pagination.total = users.length

        // Reset to first page if current page is beyond available pages
        const totalPages = Math.ceil(users.length / this.pagination.pageSize)
        if (this.pagination.currentPage > totalPages && totalPages > 0) {
          this.pagination.currentPage = 1
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch users'
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchUser(userId: string) {
      this.loading = true
      this.error = null

      try {
        const user = await getUser(userId)
        this.selectedUser = user

        // Update user in the list if it exists
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = user
        }

        return user
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user'
        console.error('Error fetching user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserDetails(userId: string) {
      this.loading = true
      this.error = null

      try {
        const [user, groups, apps] = await Promise.all([
          getUser(userId),
          getUserGroups(userId),
          getUserApps(userId)
        ])

        const userWithDetails = {
          ...user,
          groups,
          apps
        }

        this.selectedUser = userWithDetails as any
        return userWithDetails
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user details'
        console.error('Error fetching user details:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
      this.pagination.currentPage = 1 // Reset to first page
    },

    setFilters(filters: Partial<UserFilters>) {
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

    selectUser(user: User | null) {
      this.selectedUser = user
    },

    clearError() {
      this.error = null
    }
  }
})
