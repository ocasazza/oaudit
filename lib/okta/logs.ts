import type { LogEvent, LogFilters } from './types'
import { get, getAllPages } from './client'

/**
 * Get system logs with optional filtering
 */
export async function getSystemLogs(filters?: LogFilters): Promise<LogEvent[]> {
  const params: Record<string, any> = {}

  if (filters) {
    // Handle simple filters
    if (filters.eventType) {
      if (Array.isArray(filters.eventType)) {
        // Multiple event types
        const eventTypeFilter = filters.eventType.map(type => `eventType eq "${type}"`).join(' or ')
        params.filter = eventTypeFilter
      } else {
        params.filter = `eventType eq "${filters.eventType}"`
      }
    }

    if (filters.actor) {
      const actorFilter = `actor.alternateId eq "${filters.actor}" or actor.displayName eq "${filters.actor}"`
      params.filter = params.filter ? `(${params.filter}) and (${actorFilter})` : actorFilter
    }

    if (filters.target) {
      const targetFilter = `target.alternateId eq "${filters.target}" or target.displayName eq "${filters.target}"`
      params.filter = params.filter ? `(${params.filter}) and (${targetFilter})` : targetFilter
    }

    if (filters.outcome) {
      const outcomeFilter = `outcome.result eq "${filters.outcome}"`
      params.filter = params.filter ? `${params.filter} and ${outcomeFilter}` : outcomeFilter
    }

    // Date range
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.since = filters.dateRange.start
      }
      if (filters.dateRange.end) {
        params.until = filters.dateRange.end
      }
    }

    // Override with direct Okta filter if provided
    if (filters.oktaFilter) {
      params.filter = filters.oktaFilter
    }

    if (filters.q) {
      params.q = filters.q
    }

    // Pagination
    if (filters.limit) {
      params.limit = filters.limit
    }
    if (filters.since && !filters.dateRange?.start) {
      params.since = filters.since
    }
    if (filters.until && !filters.dateRange?.end) {
      params.until = filters.until
    }
  }

  // If pagination is specified, use single request
  if (filters?.limit) {
    const response = await get<LogEvent[]>('/logs', params)
    return response.data
  }

  // Otherwise, get all pages (be careful with large date ranges)
  return getAllPages<LogEvent>('/logs', params, 1000) // Limit to 1000 per page for logs
}

/**
 * Get login events (authentication events)
 */
export async function getLoginEvents(filters?: Omit<LogFilters, 'eventType'>): Promise<LogEvent[]> {
  const loginEventTypes = [
    'user.session.start',
    'user.authentication.auth_via_mfa',
    'user.authentication.sso',
    'user.authentication.verify'
  ]

  return getSystemLogs({
    ...filters,
    eventType: loginEventTypes
  })
}

/**
 * Get failed login events
 */
export async function getFailedLoginEvents(filters?: Omit<LogFilters, 'eventType' | 'outcome'>): Promise<LogEvent[]> {
  return getLoginEvents({
    ...filters,
    outcome: 'FAILURE'
  })
}

/**
 * Get successful login events
 */
export async function getSuccessfulLoginEvents(filters?: Omit<LogFilters, 'eventType' | 'outcome'>): Promise<LogEvent[]> {
  return getLoginEvents({
    ...filters,
    outcome: 'SUCCESS'
  })
}

/**
 * Get administrative actions
 */
export async function getAdminActions(filters?: Omit<LogFilters, 'eventType'>): Promise<LogEvent[]> {
  const adminEventTypes = [
    'user.lifecycle.create',
    'user.lifecycle.activate',
    'user.lifecycle.deactivate',
    'user.lifecycle.suspend',
    'user.lifecycle.unsuspend',
    'user.lifecycle.delete',
    'group.user_membership.add',
    'group.user_membership.remove',
    'application.user_membership.add',
    'application.user_membership.remove',
    'application.lifecycle.create',
    'application.lifecycle.activate',
    'application.lifecycle.deactivate',
    'application.lifecycle.delete'
  ]

  return getSystemLogs({
    ...filters,
    eventType: adminEventTypes
  })
}

/**
 * Get user lifecycle events
 */
export async function getUserLifecycleEvents(filters?: Omit<LogFilters, 'eventType'>): Promise<LogEvent[]> {
  const userLifecycleTypes = [
    'user.lifecycle.create',
    'user.lifecycle.activate',
    'user.lifecycle.deactivate',
    'user.lifecycle.suspend',
    'user.lifecycle.unsuspend',
    'user.lifecycle.delete'
  ]

  return getSystemLogs({
    ...filters,
    eventType: userLifecycleTypes
  })
}

/**
 * Get application events
 */
export async function getApplicationEvents(filters?: Omit<LogFilters, 'eventType'>): Promise<LogEvent[]> {
  const appEventTypes = [
    'application.lifecycle.create',
    'application.lifecycle.activate',
    'application.lifecycle.deactivate',
    'application.lifecycle.delete',
    'application.user_membership.add',
    'application.user_membership.remove'
  ]

  return getSystemLogs({
    ...filters,
    eventType: appEventTypes
  })
}

/**
 * Get group events
 */
export async function getGroupEvents(filters?: Omit<LogFilters, 'eventType'>): Promise<LogEvent[]> {
  const groupEventTypes = [
    'group.lifecycle.create',
    'group.lifecycle.activate',
    'group.lifecycle.deactivate',
    'group.lifecycle.delete',
    'group.user_membership.add',
    'group.user_membership.remove'
  ]

  return getSystemLogs({
    ...filters,
    eventType: groupEventTypes
  })
}

/**
 * Get events for a specific user
 */
export async function getEventsForUser(userId: string, filters?: Omit<LogFilters, 'actor' | 'target'>): Promise<LogEvent[]> {
  return getSystemLogs({
    ...filters,
    oktaFilter: `actor.id eq "${userId}" or target.id eq "${userId}"`
  })
}

/**
 * Get events for a specific application
 */
export async function getEventsForApplication(appId: string, filters?: Omit<LogFilters, 'target'>): Promise<LogEvent[]> {
  return getSystemLogs({
    ...filters,
    oktaFilter: `target.id eq "${appId}"`
  })
}

/**
 * Get suspicious login events
 */
export async function getSuspiciousLoginEvents(filters?: Omit<LogFilters, 'eventType'>): Promise<LogEvent[]> {
  const suspiciousEventTypes = [
    'user.session.start',
    'user.authentication.auth_via_mfa'
  ]

  // Get login events and filter for suspicious patterns
  const events = await getSystemLogs({
    ...filters,
    eventType: suspiciousEventTypes
  })

  // Filter for events that might be suspicious
  return events.filter(event => {
    // Multiple failed attempts
    if (event.outcome?.result === 'FAILURE') return true

    // Login from new location/device
    if (event.debugContext?.debugData?.suspiciousActivity) return true

    // MFA challenges
    if (event.eventType === 'user.authentication.auth_via_mfa') return true

    return false
  })
}

/**
 * Get login statistics for a date range
 */
export async function getLoginStatistics(dateRange: { start: string; end: string }): Promise<{
  totalLogins: number
  successfulLogins: number
  failedLogins: number
  uniqueUsers: number
  topUsers: Array<{ userId: string; displayName: string; loginCount: number }>
  loginsByHour: Record<string, number>
}> {
  const loginEvents = await getLoginEvents({ dateRange })

  const stats = {
    totalLogins: loginEvents.length,
    successfulLogins: loginEvents.filter(e => e.outcome?.result === 'SUCCESS').length,
    failedLogins: loginEvents.filter(e => e.outcome?.result === 'FAILURE').length,
    uniqueUsers: new Set(loginEvents.map(e => e.actor?.id).filter(Boolean)).size,
    topUsers: [] as Array<{ userId: string; displayName: string; loginCount: number }>,
    loginsByHour: {} as Record<string, number>
  }

  // Calculate top users
  const userCounts: Record<string, { displayName: string; count: number }> = {}
  loginEvents.forEach(event => {
    if (event.actor?.id) {
      const userId = event.actor.id
      if (!userCounts[userId]) {
        userCounts[userId] = {
          displayName: event.actor.displayName || event.actor.alternateId || userId,
          count: 0
        }
      }
      userCounts[userId].count++
    }
  })

  stats.topUsers = Object.entries(userCounts)
    .map(([userId, data]) => ({
      userId,
      displayName: data.displayName,
      loginCount: data.count
    }))
    .sort((a, b) => b.loginCount - a.loginCount)
    .slice(0, 10)

  // Calculate logins by hour
  loginEvents.forEach(event => {
    const hour = new Date(event.published).getHours().toString().padStart(2, '0')
    stats.loginsByHour[hour] = (stats.loginsByHour[hour] || 0) + 1
  })

  return stats
}

/**
 * Get recent events (last 24 hours)
 */
export async function getRecentEvents(limit: number = 100): Promise<LogEvent[]> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return getSystemLogs({
    dateRange: {
      start: yesterday.toISOString(),
      end: new Date().toISOString()
    },
    limit
  })
}

/**
 * Search logs by query
 */
export async function searchLogs(query: string, filters?: Omit<LogFilters, 'q'>): Promise<LogEvent[]> {
  return getSystemLogs({
    ...filters,
    q: query
  })
}
