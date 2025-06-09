import type { OktaConfig, OktaError, OktaResponse } from './types'
import { OktaApiError } from './types'

// Global configuration
let config: OktaConfig | null = null

/**
 * Configure the Okta client with domain and API token
 */
export function configureOktaClient(oktaConfig: OktaConfig): void {
  config = oktaConfig
}

/**
 * Get the current configuration
 */
export function getConfig(): OktaConfig {
  if (!config) {
    throw new Error('Okta client not configured. Call configureOktaClient() first.')
  }
  return config
}

/**
 * Build the full API URL
 */
function buildUrl(endpoint: string): string {
  const { domain } = getConfig()
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
  return `${baseUrl}/api/v1${endpoint}`
}

/**
 * Build request headers
 */
function buildHeaders(): HeadersInit {
  const { apiToken } = getConfig()
  return {
    'Authorization': `SSWS ${apiToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}

/**
 * Parse rate limit headers from response
 */
function parseRateLimit(response: Response) {
  const limit = response.headers.get('X-Rate-Limit-Limit')
  const remaining = response.headers.get('X-Rate-Limit-Remaining')
  const reset = response.headers.get('X-Rate-Limit-Reset')

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10)
    }
  }
  return undefined
}

/**
 * Handle API errors
 */
async function handleError(response: Response): Promise<never> {
  let error: OktaError

  try {
    error = await response.json()
  } catch {
    error = {
      errorCode: 'UNKNOWN_ERROR',
      errorSummary: `HTTP ${response.status}: ${response.statusText}`
    }
  }

  throw new OktaApiError(response.status, response.statusText, error, response)
}

/**
 * Make a GET request to the Okta API
 */
export async function get<T>(endpoint: string, params?: Record<string, any>): Promise<OktaResponse<T>> {
  const url = new URL(buildUrl(endpoint))

  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)))
        } else {
          url.searchParams.append(key, String(value))
        }
      }
    })
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders()
  })

  if (!response.ok) {
    await handleError(response)
  }

  const data = await response.json()
  const rateLimit = parseRateLimit(response)

  return {
    data,
    response,
    rateLimit
  }
}

/**
 * Make a POST request to the Okta API
 */
export async function post<T>(endpoint: string, body?: any): Promise<OktaResponse<T>> {
  const response = await fetch(buildUrl(endpoint), {
    method: 'POST',
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    await handleError(response)
  }

  const data = await response.json()
  const rateLimit = parseRateLimit(response)

  return {
    data,
    response,
    rateLimit
  }
}

/**
 * Make a PUT request to the Okta API
 */
export async function put<T>(endpoint: string, body?: any): Promise<OktaResponse<T>> {
  const response = await fetch(buildUrl(endpoint), {
    method: 'PUT',
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    await handleError(response)
  }

  const data = await response.json()
  const rateLimit = parseRateLimit(response)

  return {
    data,
    response,
    rateLimit
  }
}

/**
 * Make a DELETE request to the Okta API
 */
export async function del<T>(endpoint: string): Promise<OktaResponse<T>> {
  const response = await fetch(buildUrl(endpoint), {
    method: 'DELETE',
    headers: buildHeaders()
  })

  if (!response.ok) {
    await handleError(response)
  }

  // DELETE requests might not return JSON
  let data: T
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = null as T
  }

  const rateLimit = parseRateLimit(response)

  return {
    data,
    response,
    rateLimit
  }
}

/**
 * Handle paginated requests automatically
 */
export async function getAllPages<T>(
  endpoint: string,
  params?: Record<string, any>,
  limit?: number
): Promise<T[]> {
  const results: T[] = []
  let after: string | undefined
  let hasMore = true
  const pageLimit = limit || 200 // Okta's default max

  while (hasMore) {
    const queryParams = {
      ...params,
      limit: pageLimit,
      ...(after && { after })
    }

    const response = await get<T[]>(endpoint, queryParams)
    results.push(...response.data)

    // Check for pagination
    const linkHeader = response.response.headers.get('link')
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
      if (nextMatch) {
        const nextUrl = new URL(nextMatch[1])
        after = nextUrl.searchParams.get('after') || undefined
        hasMore = !!after
      } else {
        hasMore = false
      }
    } else {
      // If no link header, check if we got fewer results than requested
      hasMore = response.data.length === pageLimit
      if (hasMore && response.data.length > 0) {
        // Use the last item's ID as the cursor for next page
        const lastItem = response.data[response.data.length - 1] as any
        after = lastItem.id
      }
    }
  }

  return results
}

/**
 * Build Okta filter string from simple filter object
 */
export function buildFilter(filters: Record<string, any>): string {
  const conditions: string[] = []

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    switch (key) {
      case 'status':
        conditions.push(`status eq "${value}"`)
        break
      case 'email':
        conditions.push(`profile.email eq "${value}"`)
        break
      case 'department':
        conditions.push(`profile.department eq "${value}"`)
        break
      case 'type':
        conditions.push(`type eq "${value}"`)
        break
      case 'lastUpdated':
        if (value.after) {
          conditions.push(`lastUpdated gt "${value.after}"`)
        }
        if (value.before) {
          conditions.push(`lastUpdated lt "${value.before}"`)
        }
        break
    }
  })

  return conditions.join(' and ')
}

/**
 * Test the connection to Okta
 */
export async function testConnection(): Promise<boolean> {
  try {
    await get('/users', { limit: 1 })
    return true
  } catch (error) {
    console.error('Okta connection test failed:', error)
    return false
  }
}
