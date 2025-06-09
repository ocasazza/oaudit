import type { Group, User, Application, GroupFilters } from './types'
import { get, getAllPages, buildFilter } from './client'
import { mockGroups, mockGroupApplications, mockUserGroupMemberships, mockUsers } from './mock'

/**
 * Get all groups with optional filtering and pagination
 */
export async function getAllGroups(filters?: GroupFilters): Promise<Group[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  let filteredGroups = [...mockGroups]

  if (filters) {
    // Apply type filter
    if (filters.type) {
      filteredGroups = filteredGroups.filter(group => group.type === filters.type)
    }

    // Apply search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filteredGroups = filteredGroups.filter(group =>
        group.profile.name.toLowerCase().includes(query) ||
        group.profile.description?.toLowerCase().includes(query)
      )
    }

    // Apply q filter (general query)
    if (filters.q) {
      const query = filters.q.toLowerCase()
      filteredGroups = filteredGroups.filter(group =>
        group.profile.name.toLowerCase().includes(query) ||
        group.profile.description?.toLowerCase().includes(query)
      )
    }
  }

  return filteredGroups
}

/**
 * Get a specific group by ID
 */
export async function getGroup(groupId: string): Promise<Group> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  const group = mockGroups.find(g => g.id === groupId)
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`)
  }
  return group
}

/**
 * Get all members of a group
 */
export async function getGroupMembers(groupId: string): Promise<User[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Find users who belong to this group
  const memberUserIds: string[] = []

  // Look through all user group memberships to find users in this group
  Object.entries(mockUserGroupMemberships).forEach(([userId, groupIds]) => {
    if (groupIds.includes(groupId)) {
      memberUserIds.push(userId)
    }
  })

  // Return the full user objects for those IDs
  const members = mockUsers.filter(user => memberUserIds.includes(user.id))

  return members
}

/**
 * Get all applications assigned to a group
 */
export async function getGroupApps(groupId: string): Promise<Application[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Get applications for this group from mock data
  return mockGroupApplications[groupId] || []
}

/**
 * Search groups with a simple query
 */
export async function searchGroups(query: string, limit?: number): Promise<Group[]> {
  const params: Record<string, any> = {
    q: query
  }

  if (limit) {
    params.limit = limit
    const response = await get<Group[]>('/groups', params)
    return response.data
  }

  return getAllPages<Group>('/groups', params)
}

/**
 * Get groups by type
 */
export async function getGroupsByType(type: Group['type']): Promise<Group[]> {
  return getAllGroups({ type })
}

/**
 * Get Okta groups only (excludes app groups)
 */
export async function getOktaGroups(): Promise<Group[]> {
  return getGroupsByType('OKTA_GROUP')
}

/**
 * Get application groups only
 */
export async function getAppGroups(): Promise<Group[]> {
  return getGroupsByType('APP_GROUP')
}

/**
 * Get built-in groups
 */
export async function getBuiltInGroups(): Promise<Group[]> {
  return getGroupsByType('BUILT_IN')
}

/**
 * Get group membership count
 */
export async function getGroupMemberCount(groupId: string): Promise<number> {
  const members = await getGroupMembers(groupId)
  return members.length
}

/**
 * Get detailed group information including members and apps
 */
export async function getGroupDetails(groupId: string): Promise<{
  group: Group
  members: User[]
  apps: Application[]
  memberCount: number
}> {
  const [group, members, apps] = await Promise.all([
    getGroup(groupId),
    getGroupMembers(groupId),
    getGroupApps(groupId)
  ])

  return {
    group,
    members,
    apps,
    memberCount: members.length
  }
}

/**
 * Get groups with member counts
 */
export async function getGroupsWithMemberCounts(): Promise<Array<Group & { memberCount: number }>> {
  const groups = await getAllGroups()

  const groupsWithCounts = await Promise.all(
    groups.map(async (group) => {
      const memberCount = await getGroupMemberCount(group.id)
      return { ...group, memberCount }
    })
  )

  return groupsWithCounts
}

/**
 * Get empty groups (groups with no members)
 */
export async function getEmptyGroups(): Promise<Group[]> {
  const groupsWithCounts = await getGroupsWithMemberCounts()
  return groupsWithCounts
    .filter(group => group.memberCount === 0)
    .map(({ memberCount, ...group }) => group)
}

/**
 * Get groups that a user belongs to
 */
export async function getGroupsForUser(userId: string): Promise<Group[]> {
  return getAllPages<Group>(`/users/${userId}/groups`)
}

/**
 * Find groups by name pattern
 */
export async function findGroupsByName(namePattern: string): Promise<Group[]> {
  return getAllGroups({
    oktaFilter: `profile.name sw "${namePattern}"`
  })
}

/**
 * Get group statistics
 */
export async function getGroupStatistics(): Promise<{
  totalGroups: number
  oktaGroups: number
  appGroups: number
  builtInGroups: number
  emptyGroups: number
  averageMemberCount: number
}> {
  const [allGroups, emptyGroups] = await Promise.all([
    getGroupsWithMemberCounts(),
    getEmptyGroups()
  ])

  const stats = {
    totalGroups: allGroups.length,
    oktaGroups: allGroups.filter(g => g.type === 'OKTA_GROUP').length,
    appGroups: allGroups.filter(g => g.type === 'APP_GROUP').length,
    builtInGroups: allGroups.filter(g => g.type === 'BUILT_IN').length,
    emptyGroups: emptyGroups.length,
    averageMemberCount: allGroups.length > 0
      ? Math.round(allGroups.reduce((sum, g) => sum + g.memberCount, 0) / allGroups.length)
      : 0
  }

  return stats
}

/**
 * Batch get multiple groups by IDs
 */
export async function getMultipleGroups(groupIds: string[]): Promise<Group[]> {
  const groups = await Promise.all(
    groupIds.map(id => getGroup(id).catch(() => null))
  )
  return groups.filter((group): group is Group => group !== null)
}
