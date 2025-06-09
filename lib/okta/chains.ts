import type {
  User,
  Group,
  Application,
  GroupRule,
  AccessChain,
  AccessPathNode,
  GraphData,
  GraphNode,
  GraphEdge
} from './types'
import { getUser } from './users'
import { getApplication } from './apps'
import { getGroup, getGroupsForUser } from './groups'
import { getGroupRules, parseRuleExpression } from './rules'
import {
  mockUsers,
  mockUserAppLinks,
  mockUserGroupMemberships,
  mockGroups,
  mockGroupApplications,
  mockRules,
  mockGroupRules
} from './mock'

/**
 * Trace how a user gets access to a specific application
 */
export async function traceUserToApp(userId: string, appId: string): Promise<AccessChain> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const user = await getUser(userId)
  const application = await getApplication(appId)

  const path: AccessPathNode[] = [
    {
      type: 'user',
      id: userId,
      name: `${user.profile.firstName} ${user.profile.lastName}`.trim() || user.profile.login,
      reason: 'Starting point'
    }
  ]

  // Check if user has direct access to the app
  const userAppLinks = mockUserAppLinks[userId] || []
  const hasDirectAccess = userAppLinks.some(link => link.appInstanceId === appId)

  if (hasDirectAccess) {
    // Direct assignment path
    path.push({
      type: 'application',
      id: appId,
      name: application.label,
      reason: 'Direct assignment'
    })
  } else {
    // Check group-based access
    const userGroupIds = mockUserGroupMemberships[userId] || []

    for (const groupId of userGroupIds) {
      const groupApps = mockGroupApplications[groupId] || []
      const hasGroupAccess = groupApps.some(app => app.id === appId)

      if (hasGroupAccess) {
        const group = mockGroups.find(g => g.id === groupId)
        if (!group) continue

        // Check if user got into this group via a rule
        const groupRules = mockGroupRules[groupId] || []
        const applicableRule = groupRules.find(rule => {
          if (rule.status !== 'ACTIVE') return false

          // Simple rule evaluation based on user attributes
          const expression = rule.conditions.expression.value
          if (expression.includes('department') && user.profile.department) {
            return expression.includes(`"${user.profile.department}"`)
          }
          if (expression.includes('title') && user.profile.title) {
            return expression.includes(`"${user.profile.title}"`)
          }
          return false
        })

        if (applicableRule) {
          // Rule-based assignment path
          path.push({
            type: 'rule',
            id: applicableRule.id,
            name: applicableRule.name,
            reason: 'User matches rule condition',
            ruleExpression: applicableRule.conditions.expression.value,
            humanReadableReason: parseRuleExpression(applicableRule.conditions.expression.value)
          })
        }

        path.push({
          type: 'group',
          id: groupId,
          name: group.profile.name,
          reason: applicableRule ? 'Assigned by rule' : 'Direct membership'
        })

        path.push({
          type: 'application',
          id: appId,
          name: application.label,
          reason: `Access granted via group "${group.profile.name}"`
        })

        break // Use first matching group
      }
    }
  }

  return {
    user,
    application,
    path,
    totalHops: path.length - 1
  }
}

/**
 * Get a complete access graph for a user showing all relationships
 */
export async function getAccessGraph(userId: string, maxDepth: number = 3): Promise<GraphData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const processedIds = new Set<string>()

  // Start with the user
  const user = await getUser(userId)
  const userNode: GraphNode = {
    id: user.id,
    type: 'user',
    label: `${user.profile.firstName} ${user.profile.lastName}`.trim() || user.profile.login,
    data: user,
    x: 100,
    y: 200,
    color: '#3B82F6', // Blue
    size: 25
  }
  nodes.push(userNode)
  processedIds.add(`user:${user.id}`)

  // Get user's groups from mock data
  const userGroupIds = mockUserGroupMemberships[userId] || []
  const userGroups = mockGroups.filter(group => userGroupIds.includes(group.id))

  let currentX = 250
  let currentY = 200

  for (const group of userGroups) {
    if (!processedIds.has(`group:${group.id}`)) {
      const groupNode: GraphNode = {
        id: group.id,
        type: 'group',
        label: group.profile.name,
        data: group,
        x: currentX + 150,
        y: currentY,
        color: '#10B981', // Green
        size: 20
      }
      nodes.push(groupNode)
      processedIds.add(`group:${group.id}`)

      // Get rules that assign users to this group
      const groupRules = mockGroupRules[group.id] || []

      for (const rule of groupRules) {
        if (rule.status === 'ACTIVE' && !processedIds.has(`rule:${rule.id}`)) {
          const ruleNode: GraphNode = {
            id: rule.id,
            type: 'rule',
            label: rule.name,
            data: rule,
            x: currentX,
            y: currentY,
            color: '#F59E0B', // Orange
            size: 15
          }
          nodes.push(ruleNode)
          processedIds.add(`rule:${rule.id}`)

          // Check if rule applies to this user
          const ruleCondition = rule.conditions.expression.value
          let ruleApplies = false

          if (ruleCondition.includes('department') && user.profile.department) {
            if (ruleCondition.includes(`"${user.profile.department}"`)) {
              ruleApplies = true
            }
          }
          if (ruleCondition.includes('title') && user.profile.title) {
            if (ruleCondition.includes(`"${user.profile.title}"`)) {
              ruleApplies = true
            }
          }

          if (ruleApplies) {
            edges.push({
              id: `${user.id}-${rule.id}`,
              source: user.id,
              target: rule.id,
              type: 'rule_assignment',
              label: 'matches rule',
              color: '#F59E0B'
            })

            // Add edge from rule to group
            edges.push({
              id: `${rule.id}-${group.id}`,
              source: rule.id,
              target: group.id,
              type: 'rule_assignment',
              label: 'assigns to',
              color: '#F59E0B'
            })
          }
        }
      }

      // If no rule found, add direct membership edge
      if (groupRules.length === 0 || !groupRules.some(r => r.status === 'ACTIVE')) {
        edges.push({
          id: `${user.id}-${group.id}`,
          source: user.id,
          target: group.id,
          type: 'membership',
          label: 'member of',
          color: '#6B7280'
        })
      }

      // Get applications assigned to this group
      const groupApps = mockGroupApplications[group.id] || []

      let appY = currentY - 50
      for (const app of groupApps) {
        if (!processedIds.has(`app:${app.id}`)) {
          const appNode: GraphNode = {
            id: app.id,
            type: 'application',
            label: app.label,
            data: app,
            x: currentX + 300,
            y: appY,
            color: '#8B5CF6', // Purple
            size: 22
          }
          nodes.push(appNode)
          processedIds.add(`app:${app.id}`)
          appY += 100
        }

        // Add edge from group to application
        edges.push({
          id: `${group.id}-${app.id}`,
          source: group.id,
          target: app.id,
          type: 'app_access',
          label: 'grants access to',
          color: '#8B5CF6'
        })
      }

      currentY += 100
    }
  }

  // Get applications directly assigned to user
  const userAppLinks = mockUserAppLinks[userId] || []

  let directAppY = 300
  for (const appLink of userAppLinks) {
    if (!processedIds.has(`app:${appLink.appInstanceId}`)) {
      // Create a simplified application object from AppLink
      const appData = {
        id: appLink.appInstanceId,
        name: appLink.appName,
        label: appLink.label,
        status: 'ACTIVE' as const,
        lastUpdated: '',
        created: '',
        signOnMode: '',
        _links: {}
      }

      const appNode: GraphNode = {
        id: appLink.appInstanceId,
        type: 'application',
        label: appLink.label,
        data: appData,
        x: 400,
        y: directAppY,
        color: '#8B5CF6', // Purple
        size: 22
      }
      nodes.push(appNode)
      processedIds.add(`app:${appLink.appInstanceId}`)
      directAppY += 100
    }

    // Add edge from user to application (direct assignment)
    const directEdgeId = `${user.id}-${appLink.appInstanceId}-direct`
    if (!edges.some(e => e.id === directEdgeId)) {
      edges.push({
        id: directEdgeId,
        source: user.id,
        target: appLink.appInstanceId,
        type: 'assignment',
        label: 'directly assigned',
        color: '#EF4444' // Red for direct assignments
      })
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      centerNodeId: userId,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      maxDepth
    }
  }
}

/**
 * Analyze why a user is in a specific group
 */
export async function analyzeGroupMembership(userId: string, groupId: string): Promise<AccessPathNode[]> {
  const path: AccessPathNode[] = []

  try {
    const user = await getUser(userId)
    const group = await getGroup(groupId)

    // Start with user
    path.push({
      type: 'user',
      id: user.id,
      name: `${user.profile.firstName} ${user.profile.lastName}`.trim() || user.profile.login,
      reason: 'Starting point'
    })

    // Check if user is in group via rules
    const groupRules = mockGroupRules[groupId] || []

    for (const rule of groupRules) {
      if (rule.status === 'ACTIVE') {
        const ruleCondition = rule.conditions.expression.value
        const humanReadable = parseRuleExpression(ruleCondition)

        // Check if rule applies to this user
        let ruleApplies = false
        if (ruleCondition.includes('department') && user.profile.department) {
          if (ruleCondition.includes(`"${user.profile.department}"`)) {
            ruleApplies = true
          }
        }
        if (ruleCondition.includes('title') && user.profile.title) {
          if (ruleCondition.includes(`"${user.profile.title}"`)) {
            ruleApplies = true
          }
        }

        if (ruleApplies) {
          // Add rule to path
          path.push({
            type: 'rule',
            id: rule.id,
            name: rule.name,
            reason: `Rule condition: ${humanReadable}`,
            ruleExpression: ruleCondition,
            humanReadableReason: humanReadable
          })
          break // Use first matching rule
        }
      }
    }

    // Add the target group
    path.push({
      type: 'group',
      id: group.id,
      name: group.profile.name,
      reason: groupRules.length > 0 ? 'Assigned by rule' : 'Direct membership'
    })

  } catch (error) {
    console.error('Error analyzing group membership:', error)
  }

  return path
}

/**
 * Get all access chains for a user (to all their applications)
 */
export async function getAllUserAccessChains(userId: string): Promise<AccessChain[]> {
  const chains: AccessChain[] = []

  try {
    // Get all applications the user has access to (direct + group-based)
    const allAppIds = new Set<string>()

    // Add direct app assignments
    const userAppLinks = mockUserAppLinks[userId] || []
    userAppLinks.forEach(link => allAppIds.add(link.appInstanceId))

    // Add group-based app assignments
    const userGroupIds = mockUserGroupMemberships[userId] || []
    userGroupIds.forEach(groupId => {
      const groupApps = mockGroupApplications[groupId] || []
      groupApps.forEach(app => allAppIds.add(app.id))
    })

    // Get access chain for each application
    for (const appId of allAppIds) {
      try {
        const chain = await traceUserToApp(userId, appId)
        chains.push(chain)
      } catch (error) {
        console.warn(`Error tracing access to app ${appId}:`, error)
      }
    }
  } catch (error) {
    console.error('Error getting user access chains:', error)
  }

  return chains
}

/**
 * Find all users who have access to an application and how they get it
 */
export async function getApplicationAccessChains(appId: string): Promise<AccessChain[]> {
  const chains: AccessChain[] = []

  try {
    // Find all users who have access to this app
    const userIds = new Set<string>()

    // Check direct assignments
    Object.entries(mockUserAppLinks).forEach(([userId, appLinks]) => {
      if (appLinks.some(link => link.appInstanceId === appId)) {
        userIds.add(userId)
      }
    })

    // Check group-based assignments
    Object.entries(mockGroupApplications).forEach(([groupId, apps]) => {
      if (apps.some(app => app.id === appId)) {
        // Find users in this group
        Object.entries(mockUserGroupMemberships).forEach(([userId, groupIds]) => {
          if (groupIds.includes(groupId)) {
            userIds.add(userId)
          }
        })
      }
    })

    // Get access chain for each user
    for (const userId of userIds) {
      try {
        const chain = await traceUserToApp(userId, appId)
        chains.push(chain)
      } catch (error) {
        console.warn(`Error tracing access for user ${userId}:`, error)
      }
    }
  } catch (error) {
    console.error('Error getting application access chains:', error)
  }

  return chains
}

/**
 * Get statistics about access complexity
 */
export async function getAccessComplexityStats(userId: string): Promise<{
  totalApplications: number
  directAssignments: number
  groupBasedAssignments: number
  ruleBasedAssignments: number
  averageHopsToAccess: number
  mostComplexPath: AccessChain | null
}> {
  const chains = await getAllUserAccessChains(userId)

  let directCount = 0
  let groupCount = 0
  let ruleCount = 0
  let totalHops = 0
  let mostComplexPath: AccessChain | null = null
  let maxHops = 0

  for (const chain of chains) {
    totalHops += chain.totalHops

    if (chain.totalHops > maxHops) {
      maxHops = chain.totalHops
      mostComplexPath = chain
    }

    // Analyze path type
    const hasRule = chain.path.some(node => node.type === 'rule')
    const hasGroup = chain.path.some(node => node.type === 'group')

    if (hasRule) {
      ruleCount++
    } else if (hasGroup) {
      groupCount++
    } else {
      directCount++
    }
  }

  return {
    totalApplications: chains.length,
    directAssignments: directCount,
    groupBasedAssignments: groupCount,
    ruleBasedAssignments: ruleCount,
    averageHopsToAccess: chains.length > 0 ? Math.round((totalHops / chains.length) * 100) / 100 : 0,
    mostComplexPath
  }
}
