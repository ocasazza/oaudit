import type { Group, Application } from '../types'

export const mockGroups: Group[] = [
  {
    id: '1',
    type: 'OKTA_GROUP',
    created: '2023-01-15T10:00:00Z',
    lastUpdated: '2024-06-08T09:30:00Z',
    objectClass: ['okta:user_group'],
    profile: {
      name: 'Engineering Team',
      description: 'Software engineers and developers'
    }
  },
  {
    id: '2',
    type: 'OKTA_GROUP',
    created: '2023-02-20T14:00:00Z',
    lastUpdated: '2024-06-07T16:45:00Z',
    objectClass: ['okta:user_group'],
    profile: {
      name: 'Marketing Team',
      description: 'Marketing and communications team'
    }
  },
  {
    id: '3',
    type: 'OKTA_GROUP',
    created: '2023-03-10T11:00:00Z',
    lastUpdated: '2024-06-08T08:15:00Z',
    objectClass: ['okta:user_group'],
    profile: {
      name: 'Sales Team',
      description: 'Sales representatives and managers'
    }
  },
  {
    id: '4',
    type: 'OKTA_GROUP',
    created: '2023-04-05T13:30:00Z',
    lastUpdated: '2024-06-06T17:20:00Z',
    objectClass: ['okta:user_group'],
    profile: {
      name: 'HR Team',
      description: 'Human resources department'
    }
  },
  {
    id: '5',
    type: 'BUILT_IN',
    created: '2022-01-01T00:00:00Z',
    lastUpdated: '2024-06-01T00:00:00Z',
    objectClass: ['okta:user_group'],
    profile: {
      name: 'Everyone',
      description: 'All users in the organization'
    }
  },
  {
    id: '6',
    type: 'APP_GROUP',
    created: '2023-05-15T13:30:00Z',
    lastUpdated: '2024-06-06T17:20:00Z',
    objectClass: ['okta:app_group'],
    profile: {
      name: 'GitHub Admins',
      description: 'GitHub Enterprise administrators'
    }
  }
]

// Mock group applications - which apps are assigned to which groups
export const mockGroupApplications: Record<string, Application[]> = {
  '1': [ // Engineering Team
    {
      id: '1',
      name: 'github-app',
      label: 'GitHub Enterprise',
      status: 'ACTIVE',
      signOnMode: 'SAML_2_0',
      created: '2023-01-15T10:00:00Z',
      lastUpdated: '2024-06-08T09:30:00Z',
      features: ['IMPORT_NEW_USERS', 'PROFILE_MASTERING'],
      settings: {
        app: {
          baseUrl: 'https://github.company.com'
        }
      }
    },
    {
      id: '6',
      name: 'aws-app',
      label: 'AWS Console',
      status: 'ACTIVE',
      signOnMode: 'SAML_2_0',
      created: '2023-06-15T14:00:00Z',
      lastUpdated: '2024-06-08T10:30:00Z',
      features: ['IMPORT_NEW_USERS', 'PROFILE_MASTERING'],
      settings: {
        app: {
          baseUrl: 'https://console.aws.amazon.com'
        }
      }
    }
  ],
  '2': [], // Marketing Team - no apps
  '3': [], // Sales Team - no apps
  '4': [], // HR Team - no apps
  '5': [ // Everyone
    {
      id: '4',
      name: 'slack-app',
      label: 'Slack',
      status: 'ACTIVE',
      signOnMode: 'SECURE_WEB_AUTHENTICATION',
      created: '2023-04-05T13:30:00Z',
      lastUpdated: '2024-06-06T17:20:00Z',
      features: ['IMPORT_NEW_USERS'],
      settings: {
        app: {
          baseUrl: 'https://company.slack.com'
        }
      }
    }
  ],
  '6': [] // GitHub Admins - no apps
}

// Mock user group memberships - which users belong to which groups
export const mockUserGroupMemberships: Record<string, string[]> = {
  '1': ['1', '5'], // John Doe: Engineering Team, Everyone
  '2': ['2', '5'], // Jane Smith: Marketing Team, Everyone
  '3': ['1', '5'], // Mike Wilson: Engineering Team, Everyone
  '4': ['3', '5'], // Sarah Johnson: Sales Team, Everyone
  '5': ['4', '5'], // David Brown: HR Team, Everyone
  '6': ['5']       // Lisa Garcia: Everyone only
}
