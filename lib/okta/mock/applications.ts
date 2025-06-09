import type { Application } from '../types'

export const mockApplications: Application[] = [
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
    id: '2',
    name: 'jira-app',
    label: 'Jira Software',
    status: 'ACTIVE',
    signOnMode: 'OPENID_CONNECT',
    created: '2023-02-20T14:00:00Z',
    lastUpdated: '2024-06-07T16:45:00Z',
    features: ['IMPORT_NEW_USERS'],
    settings: {
      app: {
        baseUrl: 'https://company.atlassian.net'
      }
    }
  },
  {
    id: '3',
    name: 'salesforce-app',
    label: 'Salesforce',
    status: 'ACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2023-03-10T11:00:00Z',
    lastUpdated: '2024-06-08T08:15:00Z',
    features: ['IMPORT_NEW_USERS', 'PROFILE_MASTERING', 'GROUP_PUSH'],
    settings: {
      app: {
        baseUrl: 'https://company.salesforce.com'
      }
    }
  },
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
  },
  {
    id: '5',
    name: 'confluence-app',
    label: 'Confluence',
    status: 'INACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2022-08-20T10:00:00Z',
    lastUpdated: '2024-05-20T10:00:00Z',
    features: [],
    settings: {
      app: {
        baseUrl: 'https://company.atlassian.net/wiki'
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
]
