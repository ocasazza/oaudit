// Main exports for the Okta API library

// Configuration
export { configureOktaClient, testConnection } from './client'

// Types
export type {
  // Configuration
  OktaConfig,

  // Core types
  User,
  UserProfile,
  Group,
  GroupProfile,
  Application,
  AppUser,
  AppGroup,
  AppLink,
  LogEvent,
  LogActor,
  LogClient,
  LogOutcome,

  // Filter types
  UserFilters,
  GroupFilters,
  ApplicationFilters,
  LogFilters,

  // Pagination
  PaginationOptions,
  PaginatedResponse,

  // Response types
  OktaResponse,
  OktaError,

  // Utility types
  OktaApiError,

  // New types for rules and chains
  GroupRule,
  AccessChain,
  AccessPathNode,
  GraphData,
  GraphNode,
  GraphEdge
} from './types'

// User functions
export {
  getAllUsers,
  getUser,
  getUserByLogin,
  getUserGroups,
  getUserApps,
  getUsersByGroup,
  searchUsers,
  getUsersByStatus,
  getActiveUsers,
  getDeprovisionedUsers,
  getUsersByDepartment,
  getUsersCreatedAfter,
  getUsersNotLoggedInSince,
  getUserCountByStatus,
  getUserDetails,
  getMultipleUsers
} from './users'

// Group functions
export {
  getAllGroups,
  getGroup,
  getGroupMembers,
  getGroupApps,
  searchGroups,
  getGroupsByType,
  getOktaGroups,
  getAppGroups as getAppGroupsForGroup,
  getBuiltInGroups,
  getGroupMemberCount,
  getGroupDetails,
  getGroupsWithMemberCounts,
  getEmptyGroups,
  getGroupsForUser,
  findGroupsByName,
  getGroupStatistics,
  getMultipleGroups
} from './groups'

// Application functions
export {
  getAllApplications,
  getApplication,
  getAppUsers,
  getAppGroups,
  searchApplications,
  getApplicationsByStatus,
  getActiveApplications,
  getInactiveApplications,
  getAppUserCount,
  getAppGroupCount,
  getApplicationDetails,
  getApplicationsWithCounts,
  getUnusedApplications,
  getApplicationsForUser,
  getApplicationsForGroup,
  findApplicationsByName,
  getApplicationsBySignOnMode,
  getSamlApplications,
  getOAuthApplications,
  getApplicationStatistics,
  getUserApplicationMatrix,
  getMultipleApplications
} from './apps'

// Log functions
export {
  getSystemLogs,
  getLoginEvents,
  getFailedLoginEvents,
  getSuccessfulLoginEvents,
  getAdminActions,
  getUserLifecycleEvents,
  getApplicationEvents,
  getGroupEvents,
  getEventsForUser,
  getEventsForApplication,
  getSuspiciousLoginEvents,
  getLoginStatistics,
  getRecentEvents,
  searchLogs
} from './logs'

// Rule functions
export {
  getGroupRules,
  getGroupRule,
  getRulesForGroup,
  getUsersAffectedByRule,
  getRulesByStatus,
  getActiveGroupRules,
  getInactiveGroupRules,
  searchGroupRules,
  getRuleStatistics,
  parseRuleExpression,
  getRuleDetails
} from './rules'

// Chain analysis functions
export {
  traceUserToApp,
  getAccessGraph,
  analyzeGroupMembership,
  getAllUserAccessChains,
  getApplicationAccessChains,
  getAccessComplexityStats
} from './chains'

// Import functions for convenience functions
import { getAllUsers } from './users'
import { getAllGroups } from './groups'
import { getAllApplications } from './apps'
import {
  getRecentEvents,
  getFailedLoginEvents,
  getAdminActions,
  getSuspiciousLoginEvents,
  getUserLifecycleEvents
} from './logs'
import {
  getUserApplicationMatrix,
  getApplicationsWithCounts,
  getUnusedApplications
} from './apps'
import {
  getGroupsWithMemberCounts,
  getEmptyGroups
} from './groups'

// Convenience functions for common audit tasks
export async function getComprehensiveAuditData() {
  const [users, groups, applications, recentEvents] = await Promise.all([
    getAllUsers(),
    getAllGroups(),
    getAllApplications(),
    getRecentEvents(500)
  ])

  return {
    users,
    groups,
    applications,
    recentEvents,
    summary: {
      userCount: users.length,
      groupCount: groups.length,
      applicationCount: applications.length,
      recentEventCount: recentEvents.length
    }
  }
}

export async function getSecurityAuditData(dateRange: { start: string; end: string }) {
  const [
    failedLogins,
    adminActions,
    suspiciousEvents,
    userLifecycleEvents
  ] = await Promise.all([
    getFailedLoginEvents({ dateRange }),
    getAdminActions({ dateRange }),
    getSuspiciousLoginEvents({ dateRange }),
    getUserLifecycleEvents({ dateRange })
  ])

  return {
    failedLogins,
    adminActions,
    suspiciousEvents,
    userLifecycleEvents,
    summary: {
      failedLoginCount: failedLogins.length,
      adminActionCount: adminActions.length,
      suspiciousEventCount: suspiciousEvents.length,
      userLifecycleEventCount: userLifecycleEvents.length
    }
  }
}

export async function getAccessAuditData() {
  const [
    userAppMatrix,
    groupsWithCounts,
    appsWithCounts,
    emptyGroups,
    unusedApps
  ] = await Promise.all([
    getUserApplicationMatrix(),
    getGroupsWithMemberCounts(),
    getApplicationsWithCounts(),
    getEmptyGroups(),
    getUnusedApplications()
  ])

  return {
    userAppMatrix,
    groupsWithCounts,
    appsWithCounts,
    emptyGroups,
    unusedApps,
    summary: {
      totalUsers: userAppMatrix.users.length,
      totalApplications: userAppMatrix.applications.length,
      emptyGroupCount: emptyGroups.length,
      unusedAppCount: unusedApps.length
    }
  }
}
