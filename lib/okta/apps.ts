import type { Application, AppUser, AppGroup, User, Group, ApplicationFilters } from './types'
import { get, getAllPages, buildFilter } from './client'
import { mockApplications } from './mock'

/**
 * Get all applications with optional filtering and pagination
 */
export async function getAllApplications(filters?: ApplicationFilters): Promise<Application[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  let filteredApps = [...mockApplications]

  if (filters) {
    // Apply status filter
    if (filters.status) {
      filteredApps = filteredApps.filter(app => app.status === filters.status)
    }

    // Apply search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filteredApps = filteredApps.filter(app =>
        app.label.toLowerCase().includes(query) ||
        app.name.toLowerCase().includes(query) ||
        app.signOnMode.toLowerCase().includes(query)
      )
    }

    // Apply q filter (general query)
    if (filters.q) {
      const query = filters.q.toLowerCase()
      filteredApps = filteredApps.filter(app =>
        app.label.toLowerCase().includes(query) ||
        app.name.toLowerCase().includes(query) ||
        app.signOnMode.toLowerCase().includes(query)
      )
    }
  }

  return filteredApps
}

/**
 * Get a specific application by ID
 */
export async function getApplication(appId: string): Promise<Application> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  const app = mockApplications.find(a => a.id === appId)
  if (!app) {
    throw new Error(`Application with ID ${appId} not found`)
  }
  return app
}

/**
 * Get all users assigned to an application
 */
export async function getAppUsers(appId: string): Promise<AppUser[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Mock app users data
  const mockAppUsers: AppUser[] = [
    {
      id: '1',
      created: '2023-01-15T10:00:00Z',
      lastUpdated: '2024-06-08T09:30:00Z',
      scope: 'USER',
      status: 'ACTIVE',
      profile: {
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    {
      id: '2',
      created: '2023-02-20T14:00:00Z',
      lastUpdated: '2024-06-07T16:45:00Z',
      scope: 'USER',
      status: 'ACTIVE',
      profile: {
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith'
      }
    }
  ]

  return mockAppUsers
}

/**
 * Get all groups assigned to an application
 */
export async function getAppGroups(appId: string): Promise<AppGroup[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Mock app groups data
  const mockAppGroups: AppGroup[] = [
    {
      id: '1',
      lastUpdated: '2024-06-08T09:30:00Z',
      priority: 1,
      profile: {
        name: 'Engineering Team'
      }
    },
    {
      id: '2',
      lastUpdated: '2024-06-07T16:45:00Z',
      priority: 2,
      profile: {
        name: 'All Employees'
      }
    }
  ]

  return mockAppGroups
}

/**
 * Search applications with a simple query
 */
export async function searchApplications(query: string, limit?: number): Promise<Application[]> {
  const params: Record<string, any> = {
    q: query
  }

  if (limit) {
    params.limit = limit
    const response = await get<Application[]>('/apps', params)
    return response.data
  }

  return getAllPages<Application>('/apps', params)
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(status: Application['status']): Promise<Application[]> {
  return getAllApplications({ status })
}

/**
 * Get active applications only
 */
export async function getActiveApplications(): Promise<Application[]> {
  return getApplicationsByStatus('ACTIVE')
}

/**
 * Get inactive applications
 */
export async function getInactiveApplications(): Promise<Application[]> {
  return getApplicationsByStatus('INACTIVE')
}

/**
 * Get application user count
 */
export async function getAppUserCount(appId: string): Promise<number> {
  const users = await getAppUsers(appId)
  return users.length
}

/**
 * Get application group count
 */
export async function getAppGroupCount(appId: string): Promise<number> {
  const groups = await getAppGroups(appId)
  return groups.length
}

/**
 * Get detailed application information including users and groups
 */
export async function getApplicationDetails(appId: string): Promise<{
  app: Application
  users: AppUser[]
  groups: AppGroup[]
  userCount: number
  groupCount: number
}> {
  const [app, users, groups] = await Promise.all([
    getApplication(appId),
    getAppUsers(appId),
    getAppGroups(appId)
  ])

  return {
    app,
    users,
    groups,
    userCount: users.length,
    groupCount: groups.length
  }
}

/**
 * Get applications with user and group counts
 */
export async function getApplicationsWithCounts(): Promise<Array<Application & {
  userCount: number
  groupCount: number
}>> {
  const apps = await getAllApplications()

  const appsWithCounts = await Promise.all(
    apps.map(async (app) => {
      const [userCount, groupCount] = await Promise.all([
        getAppUserCount(app.id),
        getAppGroupCount(app.id)
      ])
      return { ...app, userCount, groupCount }
    })
  )

  return appsWithCounts
}

/**
 * Get unused applications (applications with no user or group assignments)
 */
export async function getUnusedApplications(): Promise<Application[]> {
  const appsWithCounts = await getApplicationsWithCounts()
  return appsWithCounts
    .filter(app => app.userCount === 0 && app.groupCount === 0)
    .map(({ userCount, groupCount, ...app }) => app)
}

/**
 * Get applications assigned to a specific user
 */
export async function getApplicationsForUser(userId: string): Promise<Application[]> {
  // Get user's app links first, then fetch full application details
  const appLinks = await getAllPages(`/users/${userId}/appLinks`)
  const appIds = appLinks.map((link: any) => link.appInstanceId)

  const apps = await Promise.all(
    appIds.map(id => getApplication(id).catch(() => null))
  )

  return apps.filter((app): app is Application => app !== null)
}

/**
 * Get applications assigned to a specific group
 */
export async function getApplicationsForGroup(groupId: string): Promise<Application[]> {
  return getAllPages<Application>(`/groups/${groupId}/apps`)
}

/**
 * Find applications by name pattern
 */
export async function findApplicationsByName(namePattern: string): Promise<Application[]> {
  return searchApplications(namePattern)
}

/**
 * Get applications by sign-on mode
 */
export async function getApplicationsBySignOnMode(signOnMode: string): Promise<Application[]> {
  return getAllApplications({
    oktaFilter: `signOnMode eq "${signOnMode}"`
  })
}

/**
 * Get SAML applications
 */
export async function getSamlApplications(): Promise<Application[]> {
  return getApplicationsBySignOnMode('SAML_2_0')
}

/**
 * Get OAuth applications
 */
export async function getOAuthApplications(): Promise<Application[]> {
  const [oidc, oauth] = await Promise.all([
    getApplicationsBySignOnMode('OPENID_CONNECT'),
    getApplicationsBySignOnMode('OAUTH_2_0')
  ])
  return [...oidc, ...oauth]
}

/**
 * Get application statistics
 */
export async function getApplicationStatistics(): Promise<{
  totalApplications: number
  activeApplications: number
  inactiveApplications: number
  unusedApplications: number
  averageUserCount: number
  averageGroupCount: number
  signOnModes: Record<string, number>
}> {
  const [allApps, unusedApps] = await Promise.all([
    getApplicationsWithCounts(),
    getUnusedApplications()
  ])

  // Count sign-on modes
  const signOnModes: Record<string, number> = {}
  allApps.forEach(app => {
    signOnModes[app.signOnMode] = (signOnModes[app.signOnMode] || 0) + 1
  })

  const stats = {
    totalApplications: allApps.length,
    activeApplications: allApps.filter(app => app.status === 'ACTIVE').length,
    inactiveApplications: allApps.filter(app => app.status === 'INACTIVE').length,
    unusedApplications: unusedApps.length,
    averageUserCount: allApps.length > 0
      ? Math.round(allApps.reduce((sum, app) => sum + app.userCount, 0) / allApps.length)
      : 0,
    averageGroupCount: allApps.length > 0
      ? Math.round(allApps.reduce((sum, app) => sum + app.groupCount, 0) / allApps.length)
      : 0,
    signOnModes
  }

  return stats
}

/**
 * Get user-application assignment matrix
 */
export async function getUserApplicationMatrix(): Promise<{
  users: User[]
  applications: Application[]
  assignments: Record<string, string[]> // userId -> appIds[]
}> {
  const [users, applications] = await Promise.all([
    getAllPages<User>('/users'),
    getAllApplications()
  ])

  const assignments: Record<string, string[]> = {}

  // Get app assignments for each user
  await Promise.all(
    users.map(async (user) => {
      try {
        const userApps = await getApplicationsForUser(user.id)
        assignments[user.id] = userApps.map(app => app.id)
      } catch (error) {
        assignments[user.id] = []
      }
    })
  )

  return {
    users,
    applications,
    assignments
  }
}

/**
 * Batch get multiple applications by IDs
 */
export async function getMultipleApplications(appIds: string[]): Promise<Application[]> {
  const apps = await Promise.all(
    appIds.map(id => getApplication(id).catch(() => null))
  )
  return apps.filter((app): app is Application => app !== null)
}
