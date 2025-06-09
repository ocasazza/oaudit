import type { User, Group, AppLink, UserFilters, OktaResponse } from './types'
import { get, getAllPages, buildFilter } from './client'
import { mockUsers, mockUserAppLinks, mockUserGroupMemberships, mockGroups } from './mock'

/**
 * Get all users with optional filtering and pagination
 */
export async function getAllUsers(filters?: UserFilters): Promise<User[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  let filteredUsers = [...mockUsers]

  if (filters) {
    // Apply status filter
    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status)
    }

    // Apply department filter
    if (filters.department) {
      filteredUsers = filteredUsers.filter(user => user.profile.department === filters.department)
    }

    // Apply email filter
    if (filters.email) {
      filteredUsers = filteredUsers.filter(user => user.profile.email === filters.email)
    }

    // Apply search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.profile.firstName?.toLowerCase().includes(query) ||
        user.profile.lastName?.toLowerCase().includes(query) ||
        user.profile.email.toLowerCase().includes(query) ||
        user.profile.department?.toLowerCase().includes(query)
      )
    }

    // Apply q filter (general query)
    if (filters.q) {
      const query = filters.q.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.profile.firstName?.toLowerCase().includes(query) ||
        user.profile.lastName?.toLowerCase().includes(query) ||
        user.profile.email.toLowerCase().includes(query) ||
        user.profile.department?.toLowerCase().includes(query) ||
        user.profile.title?.toLowerCase().includes(query)
      )
    }
  }

  return filteredUsers
}

/**
 * Get a specific user by ID
 */
export async function getUser(userId: string): Promise<User> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // First try to find by ID
  let user = mockUsers.find(u => u.id === userId)

  // If not found by ID, try to find by email/login (for cases like "john.doe")
  if (!user) {
    user = mockUsers.find(u =>
      u.profile.email === userId ||
      u.profile.login === userId ||
      u.profile.email === `${userId}@company.com` ||
      u.profile.login === `${userId}@company.com`
    )
  }

  if (!user) {
    throw new Error(`User with ID ${userId} not found`)
  }
  return user
}

/**
 * Get a user by login (email)
 */
export async function getUserByLogin(login: string): Promise<User> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  const user = mockUsers.find(u => u.profile.login === login || u.profile.email === login)
  if (!user) {
    throw new Error(`User with login ${login} not found`)
  }
  return user
}

/**
 * Get all groups that a user belongs to
 */
export async function getUserGroups(userId: string): Promise<Group[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Get group IDs for this user from mock data
  const userGroupIds = mockUserGroupMemberships[userId] || []

  // Return the full group objects for those IDs
  const userGroups = mockGroups.filter(group => userGroupIds.includes(group.id))

  return userGroups
}

/**
 * Get all application links for a user
 */
export async function getUserApps(userId: string): Promise<AppLink[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Get app links for this user from mock data (direct assignments only)
  return mockUserAppLinks[userId] || []
}

/**
 * Get users by group membership
 */
export async function getUsersByGroup(groupId: string): Promise<User[]> {
  return getAllPages<User>(`/groups/${groupId}/users`)
}

/**
 * Search users with a simple query
 */
export async function searchUsers(query: string, limit?: number): Promise<User[]> {
  const params: Record<string, any> = {
    q: query
  }

  if (limit) {
    params.limit = limit
    const response = await get<User[]>('/users', params)
    return response.data
  }

  return getAllPages<User>('/users', params)
}

/**
 * Get users with specific status
 */
export async function getUsersByStatus(status: User['status']): Promise<User[]> {
  return getAllUsers({ status })
}

/**
 * Get active users only
 */
export async function getActiveUsers(): Promise<User[]> {
  return getUsersByStatus('ACTIVE')
}

/**
 * Get deprovisioned users
 */
export async function getDeprovisionedUsers(): Promise<User[]> {
  return getUsersByStatus('DEPROVISIONED')
}

/**
 * Get users by department
 */
export async function getUsersByDepartment(department: string): Promise<User[]> {
  return getAllUsers({ department })
}

/**
 * Get users created after a specific date
 */
export async function getUsersCreatedAfter(date: string): Promise<User[]> {
  return getAllUsers({
    oktaFilter: `created gt "${date}"`
  })
}

/**
 * Get users who haven't logged in since a specific date
 */
export async function getUsersNotLoggedInSince(date: string): Promise<User[]> {
  return getAllUsers({
    oktaFilter: `lastLogin lt "${date}" or lastLogin eq null`
  })
}

/**
 * Get user count by status
 */
export async function getUserCountByStatus(): Promise<Record<string, number>> {
  const users = await getAllUsers()
  const counts: Record<string, number> = {}

  users.forEach(user => {
    counts[user.status] = (counts[user.status] || 0) + 1
  })

  return counts
}

/**
 * Get detailed user information including groups and apps
 */
export async function getUserDetails(userId: string): Promise<{
  user: User
  groups: Group[]
  apps: AppLink[]
}> {
  const [user, groups, apps] = await Promise.all([
    getUser(userId),
    getUserGroups(userId),
    getUserApps(userId)
  ])

  return { user, groups, apps }
}

/**
 * Batch get multiple users by IDs
 */
export async function getMultipleUsers(userIds: string[]): Promise<User[]> {
  const users = await Promise.all(
    userIds.map(id => getUser(id).catch(() => null))
  )
  return users.filter((user): user is User => user !== null)
}
