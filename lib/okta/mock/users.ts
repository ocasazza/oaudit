import type { User, AppLink } from '../types'

export const mockUsers: User[] = [
  {
    id: '1',
    status: 'ACTIVE',
    created: '2023-01-15T10:00:00Z',
    lastLogin: '2024-06-08T09:30:00Z',
    lastUpdated: '2024-06-08T09:30:00Z',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      login: 'john.doe@company.com',
      department: 'Engineering',
      title: 'Senior Software Engineer'
    }
  },
  {
    id: '2',
    status: 'ACTIVE',
    created: '2023-02-20T14:00:00Z',
    lastLogin: '2024-06-07T16:45:00Z',
    lastUpdated: '2024-06-07T16:45:00Z',
    profile: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      login: 'jane.smith@company.com',
      department: 'Marketing',
      title: 'Marketing Manager'
    }
  },
  {
    id: '3',
    status: 'ACTIVE',
    created: '2023-03-10T11:00:00Z',
    lastLogin: '2024-06-08T08:15:00Z',
    lastUpdated: '2024-06-08T08:15:00Z',
    profile: {
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike.wilson@company.com',
      login: 'mike.wilson@company.com',
      department: 'Engineering',
      title: 'DevOps Engineer'
    }
  },
  {
    id: '4',
    status: 'STAGED',
    created: '2024-06-01T09:00:00Z',
    lastLogin: undefined,
    lastUpdated: '2024-06-01T09:00:00Z',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      login: 'sarah.johnson@company.com',
      department: 'Sales',
      title: 'Sales Representative'
    }
  },
  {
    id: '5',
    status: 'ACTIVE',
    created: '2023-05-15T13:30:00Z',
    lastLogin: '2024-06-06T17:20:00Z',
    lastUpdated: '2024-06-06T17:20:00Z',
    profile: {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@company.com',
      login: 'david.brown@company.com',
      department: 'HR',
      title: 'HR Manager'
    }
  },
  {
    id: '6',
    status: 'DEPROVISIONED',
    created: '2022-08-20T10:00:00Z',
    lastLogin: '2024-05-15T14:30:00Z',
    lastUpdated: '2024-05-20T10:00:00Z',
    profile: {
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@company.com',
      login: 'lisa.garcia@company.com',
      department: 'Finance',
      title: 'Financial Analyst'
    }
  }
]

// Mock user app links - direct assignments (not via groups)
export const mockUserAppLinks: Record<string, AppLink[]> = {
  '1': [ // John Doe - direct assignment to Jira
    {
      id: '2',
      label: 'Jira Software',
      linkUrl: 'https://company.atlassian.net',
      logoUrl: 'https://atlassian.com/favicon.ico',
      appName: 'jira',
      appInstanceId: '2',
      appAssignmentId: 'assignment2',
      credentialsSetup: true,
      hidden: false,
      sortOrder: 2
    }
  ],
  '2': [], // Jane Smith - no direct assignments
  '3': [], // Mike Wilson - no direct assignments
  '4': [], // Sarah Johnson - no direct assignments
  '5': [], // David Brown - no direct assignments
  '6': []  // Lisa Garcia - no direct assignments
}
