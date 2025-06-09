import type { GroupRule, User, Group } from './types'
import { get, getAllPages } from './client'
import { mockRules, mockGroupRules } from './mock'


/**
 * Get all group rules
 */
export async function getGroupRules(): Promise<GroupRule[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return [...mockRules]
}

/**
 * Get a specific group rule by ID
 */
export async function getGroupRule(ruleId: string): Promise<GroupRule> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  const rule = mockRules.find(r => r.id === ruleId)
  if (!rule) {
    throw new Error(`Group rule with ID ${ruleId} not found`)
  }
  return rule
}

/**
 * Get all rules that affect a specific group
 */
export async function getRulesForGroup(groupId: string): Promise<GroupRule[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Get rules for this group from mock data
  return mockGroupRules[groupId] || []
}

/**
 * Get all users that would be affected by a specific rule
 * Note: This is a simulation since Okta doesn't provide a direct endpoint
 */
export async function getUsersAffectedByRule(ruleId: string): Promise<User[]> {
  const rule = await getGroupRule(ruleId)

  // In a real implementation, you'd need to evaluate the rule expression
  // against all users. For now, we'll return users from the target groups
  const affectedUsers: User[] = []

  for (const groupId of rule.actions.assignUserToGroups.groupIds) {
    try {
      const groupUsers = await getAllPages<User>(`/groups/${groupId}/users`)
      affectedUsers.push(...groupUsers)
    } catch (error) {
      console.warn(`Could not fetch users for group ${groupId}:`, error)
    }
  }

  // Remove duplicates
  const uniqueUsers = affectedUsers.filter((user, index, self) =>
    index === self.findIndex(u => u.id === user.id)
  )

  return uniqueUsers
}

/**
 * Get rules by status
 */
export async function getRulesByStatus(status: 'ACTIVE' | 'INACTIVE'): Promise<GroupRule[]> {
  const allRules = await getGroupRules()
  return allRules.filter(rule => rule.status === status)
}

/**
 * Get active group rules only
 */
export async function getActiveGroupRules(): Promise<GroupRule[]> {
  return getRulesByStatus('ACTIVE')
}

/**
 * Get inactive group rules only
 */
export async function getInactiveGroupRules(): Promise<GroupRule[]> {
  return getRulesByStatus('INACTIVE')
}

/**
 * Search group rules by name
 */
export async function searchGroupRules(query: string): Promise<GroupRule[]> {
  const allRules = await getGroupRules()
  return allRules.filter(rule =>
    rule.name.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * Get rule statistics
 */
export async function getRuleStatistics(): Promise<{
  totalRules: number
  activeRules: number
  inactiveRules: number
  rulesWithMultipleGroups: number
  averageGroupsPerRule: number
}> {
  const allRules = await getGroupRules()

  const stats = {
    totalRules: allRules.length,
    activeRules: allRules.filter(r => r.status === 'ACTIVE').length,
    inactiveRules: allRules.filter(r => r.status === 'INACTIVE').length,
    rulesWithMultipleGroups: allRules.filter(r => r.actions.assignUserToGroups.groupIds.length > 1).length,
    averageGroupsPerRule: allRules.length > 0
      ? Math.round(allRules.reduce((sum, r) => sum + r.actions.assignUserToGroups.groupIds.length, 0) / allRules.length * 100) / 100
      : 0
  }

  return stats
}

/**
 * Parse rule expression to human-readable format
 */
export function parseRuleExpression(expression: string): string {
  // Simple parser for common Okta expressions
  const patterns = [
    { regex: /user\.department\s*==\s*["']([^"']+)["']/i, template: 'User department is "$1"' },
    { regex: /user\.title\s*==\s*["']([^"']+)["']/i, template: 'User title is "$1"' },
    { regex: /user\.manager\s*==\s*["']([^"']+)["']/i, template: 'User manager is "$1"' },
    { regex: /user\.employeeType\s*==\s*["']([^"']+)["']/i, template: 'User employee type is "$1"' },
    { regex: /user\.costCenter\s*==\s*["']([^"']+)["']/i, template: 'User cost center is "$1"' },
    { regex: /user\.division\s*==\s*["']([^"']+)["']/i, template: 'User division is "$1"' }
  ]

  for (const pattern of patterns) {
    const match = expression.match(pattern.regex)
    if (match) {
      return pattern.template.replace('$1', match[1])
    }
  }

  // If no pattern matches, return the original expression
  return expression
}

/**
 * Get detailed rule information including affected groups and users
 */
export async function getRuleDetails(ruleId: string): Promise<{
  rule: GroupRule
  affectedGroups: Group[]
  affectedUsers: User[]
  humanReadableCondition: string
}> {
  const rule = await getGroupRule(ruleId)
  const affectedUsers = await getUsersAffectedByRule(ruleId)

  // Get group details
  const affectedGroups: Group[] = []
  for (const groupId of rule.actions.assignUserToGroups.groupIds) {
    try {
      const group = await get<Group>(`/groups/${groupId}`)
      affectedGroups.push(group.data)
    } catch (error) {
      console.warn(`Could not fetch group ${groupId}:`, error)
    }
  }

  const humanReadableCondition = parseRuleExpression(rule.conditions.expression.value)

  return {
    rule,
    affectedGroups,
    affectedUsers,
    humanReadableCondition
  }
}
