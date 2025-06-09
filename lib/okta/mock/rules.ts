import type { GroupRule } from '../types'

export const mockRules: GroupRule[] = [
  {
    id: 'rule-1',
    type: 'group_rule',
    name: 'Engineering Department Auto-Assignment',
    status: 'ACTIVE',
    created: '2023-01-15T10:00:00Z',
    lastUpdated: '2024-06-08T09:30:00Z',
    conditions: {
      expression: {
        value: 'user.department == "Engineering"',
        type: 'urn:okta:expression:1.0'
      }
    },
    actions: {
      assignUserToGroups: {
        groupIds: ['1'] // Engineering Team
      }
    }
  },
  {
    id: 'rule-2',
    type: 'group_rule',
    name: 'Marketing Department Auto-Assignment',
    status: 'ACTIVE',
    created: '2023-02-20T14:00:00Z',
    lastUpdated: '2024-06-07T16:45:00Z',
    conditions: {
      expression: {
        value: 'user.department == "Marketing"',
        type: 'urn:okta:expression:1.0'
      }
    },
    actions: {
      assignUserToGroups: {
        groupIds: ['2'] // Marketing Team
      }
    }
  },
  {
    id: 'rule-3',
    type: 'group_rule',
    name: 'Sales Department Auto-Assignment',
    status: 'ACTIVE',
    created: '2023-03-10T11:00:00Z',
    lastUpdated: '2024-06-08T08:15:00Z',
    conditions: {
      expression: {
        value: 'user.department == "Sales"',
        type: 'urn:okta:expression:1.0'
      }
    },
    actions: {
      assignUserToGroups: {
        groupIds: ['3'] // Sales Team
      }
    }
  },
  {
    id: 'rule-4',
    type: 'group_rule',
    name: 'HR Department Auto-Assignment',
    status: 'ACTIVE',
    created: '2023-04-05T13:30:00Z',
    lastUpdated: '2024-06-06T17:20:00Z',
    conditions: {
      expression: {
        value: 'user.department == "HR"',
        type: 'urn:okta:expression:1.0'
      }
    },
    actions: {
      assignUserToGroups: {
        groupIds: ['4'] // HR Team
      }
    }
  }
]

// Map of group ID to rules that assign users to that group
export const mockGroupRules: Record<string, GroupRule[]> = {
  '1': [mockRules[0]], // Engineering Team - rule-1
  '2': [mockRules[1]], // Marketing Team - rule-2
  '3': [mockRules[2]], // Sales Team - rule-3
  '4': [mockRules[3]], // HR Team - rule-4
  '5': [],             // Everyone - no rules (built-in membership)
  '6': []              // GitHub Admins - no rules
}
