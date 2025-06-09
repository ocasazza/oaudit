// Core Okta API Types

// Configuration
export interface OktaConfig {
  domain: string
  apiToken: string
  rateLimit?: number
}

// Pagination
export interface PaginationOptions {
  limit?: number
  after?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  hasMore: boolean
  nextCursor?: string
}

// User Types
export interface User {
  id: string
  status: 'ACTIVE' | 'STAGED' | 'PROVISIONED' | 'RECOVERY' | 'DEPROVISIONED'
  created: string
  activated?: string
  statusChanged?: string
  lastLogin?: string
  lastUpdated: string
  passwordChanged?: string
  profile: UserProfile
  credentials?: UserCredentials
  _links?: Record<string, any>
}

export interface UserProfile {
  firstName?: string
  lastName?: string
  email: string
  login: string
  mobilePhone?: string
  secondEmail?: string
  department?: string
  title?: string
  manager?: string
  employeeNumber?: string
  [key: string]: any // Custom attributes
}

export interface UserCredentials {
  password?: any
  recovery_question?: any
  provider?: any
}

// Group Types
export interface Group {
  id: string
  created: string
  lastUpdated: string
  lastMembershipUpdated?: string
  objectClass: string[]
  type: 'OKTA_GROUP' | 'APP_GROUP' | 'BUILT_IN'
  profile: GroupProfile
  _links?: Record<string, any>
}

export interface GroupProfile {
  name: string
  description?: string
  [key: string]: any
}

// Application Types
export interface Application {
  id: string
  name: string
  label: string
  status: 'ACTIVE' | 'INACTIVE'
  lastUpdated: string
  created: string
  accessibility?: any
  visibility?: any
  features?: string[]
  signOnMode: string
  credentials?: any
  settings?: any
  _links?: Record<string, any>
}

export interface AppUser {
  id: string
  externalId?: string
  created: string
  lastUpdated: string
  scope: 'USER' | 'GROUP'
  status: 'ACTIVE' | 'INACTIVE' | 'STAGED' | 'DEPROVISIONED'
  statusChanged?: string
  passwordChanged?: string
  syncState?: 'DISABLED' | 'UNSYNCED' | 'SYNCING' | 'SYNCED'
  lastSync?: string
  credentials?: any
  profile?: Record<string, any>
  _links?: Record<string, any>
}

export interface AppGroup {
  id: string
  lastUpdated: string
  priority: number
  profile?: Record<string, any>
  _links?: Record<string, any>
}

export interface AppLink {
  id: string
  label: string
  linkUrl?: string
  logoUrl?: string
  appName: string
  appInstanceId: string
  appAssignmentId: string
  credentialsSetup: boolean
  hidden: boolean
  sortOrder: number
}

// Log Types
export interface LogEvent {
  uuid: string
  published: string
  eventType: string
  version: string
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  legacyEventType?: string
  displayMessage: string
  actor?: LogActor
  client?: LogClient
  device?: LogDevice
  authenticationContext?: LogAuthContext
  securityContext?: LogSecurityContext
  target?: LogTarget[]
  transaction?: LogTransaction
  debugContext?: LogDebugContext
  outcome?: LogOutcome
  request?: LogRequest
}

export interface LogActor {
  id: string
  type: string
  alternateId?: string
  displayName?: string
  detailEntry?: Record<string, any>
}

export interface LogClient {
  userAgent?: LogUserAgent
  zone?: string
  device?: string
  id?: string
  ipAddress?: string
  geographicalContext?: LogGeographicalContext
}

export interface LogUserAgent {
  rawUserAgent?: string
  os?: string
  browser?: string
}

export interface LogGeographicalContext {
  city?: string
  state?: string
  country?: string
  postalCode?: string
  geolocation?: LogGeolocation
}

export interface LogGeolocation {
  lat?: number
  lon?: number
}

export interface LogDevice {
  id?: string
  name?: string
  os_platform?: string
  os_version?: string
  managed?: boolean
}

export interface LogAuthContext {
  authenticationProvider?: string
  credentialProvider?: string
  credentialType?: string
  issuer?: any
  interface?: string
  authenticationStep?: number
  externalSessionId?: string
}

export interface LogSecurityContext {
  asNumber?: number
  asOrg?: string
  isp?: string
  domain?: string
  isProxy?: boolean
}

export interface LogTarget {
  id: string
  type: string
  alternateId?: string
  displayName?: string
  detailEntry?: Record<string, any>
}

export interface LogTransaction {
  type?: string
  id?: string
  detail?: Record<string, any>
}

export interface LogDebugContext {
  debugData?: Record<string, any>
}

export interface LogOutcome {
  result: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'ALLOW' | 'DENY' | 'CHALLENGE' | 'UNKNOWN'
  reason?: string
}

export interface LogRequest {
  ipChain?: LogIpChain[]
}

export interface LogIpChain {
  ip?: string
  geographicalContext?: LogGeographicalContext
  version?: string
  source?: string
}

// Filter Types
export interface UserFilters extends PaginationOptions {
  // Simple filters
  status?: 'ACTIVE' | 'STAGED' | 'PROVISIONED' | 'RECOVERY' | 'DEPROVISIONED'
  search?: string
  email?: string
  department?: string
  lastUpdated?: {
    after?: string
    before?: string
  }

  // Advanced: direct Okta filter passthrough
  oktaFilter?: string
  oktaSearch?: string
  q?: string
}

export interface GroupFilters extends PaginationOptions {
  // Simple filters
  search?: string
  type?: 'OKTA_GROUP' | 'APP_GROUP' | 'BUILT_IN'

  // Advanced
  oktaFilter?: string
  oktaSearch?: string
  q?: string
}

export interface ApplicationFilters extends PaginationOptions {
  // Simple filters
  status?: 'ACTIVE' | 'INACTIVE'
  search?: string

  // Advanced
  oktaFilter?: string
  q?: string
}

export interface LogFilters {
  // Simple filters
  eventType?: string | string[]
  actor?: string
  target?: string
  outcome?: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'ALLOW' | 'DENY' | 'CHALLENGE' | 'UNKNOWN'
  dateRange?: {
    start: string
    end: string
  }

  // Advanced
  oktaFilter?: string
  q?: string

  // Pagination
  limit?: number
  since?: string
  until?: string
}

// Error Types
export interface OktaError {
  errorCode: string
  errorSummary: string
  errorLink?: string
  errorId?: string
  errorCauses?: OktaErrorCause[]
}

export interface OktaErrorCause {
  errorSummary: string
  reason?: string
  locationType?: string
  location?: string
  domain?: string
}

export class OktaApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public error: OktaError,
    public response?: Response
  ) {
    super(`Okta API Error ${status}: ${error.errorSummary}`)
    this.name = 'OktaApiError'
  }
}

// Group Rule Types
export interface GroupRule {
  id: string
  name: string
  type: 'group_rule'
  status: 'ACTIVE' | 'INACTIVE'
  created: string
  lastUpdated: string
  conditions: {
    expression: {
      value: string
      type: 'urn:okta:expression:1.0'
    }
  }
  actions: {
    assignUserToGroups: {
      groupIds: string[]
    }
  }
  _links?: Record<string, any>
}

// Access Chain Analysis Types
export interface AccessChain {
  user: User
  application: Application
  path: AccessPathNode[]
  totalHops: number
}

export interface AccessPathNode {
  type: 'user' | 'group' | 'rule' | 'application'
  id: string
  name: string
  reason?: string
  ruleExpression?: string
  humanReadableReason?: string
  metadata?: Record<string, any>
}

export interface GraphNode {
  id: string
  type: 'user' | 'group' | 'rule' | 'application'
  label: string
  data: User | Group | GroupRule | Application
  x?: number
  y?: number
  color?: string
  size?: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'membership' | 'assignment' | 'rule_assignment' | 'app_access'
  label?: string
  reason?: string
  color?: string
  weight?: number
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    centerNodeId: string
    totalNodes: number
    totalEdges: number
    maxDepth: number
  }
}

// Response wrapper
export interface OktaResponse<T> {
  data: T
  response: Response
  rateLimit?: {
    limit: number
    remaining: number
    reset: number
  }
}
