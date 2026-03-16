const API_BASE = '/api/v1'

function getToken(): string | null {
  return localStorage.getItem('internhub_token')
}

export function setToken(token: string) {
  localStorage.setItem('internhub_token', token)
}

export function clearToken() {
  localStorage.removeItem('internhub_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

async function request<T>(
  path: string,
  options: RequestInit & { expectOk?: boolean } = {}
): Promise<T> {
  const { expectOk = true, ...init } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (expectOk && !res.ok) throw new Error((data as { error?: string }).error || res.statusText)
  return data as T
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<{ id: number; email: string; name: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<import('./types').MeResponse>('/users/me'),

  patchMe: (data: { nickname?: string; avatar?: string }) =>
    request<{ profile: import('./types').UserProfile }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getJobs: () => request<{ list: import('./types').Job[] }>('/jobs').then((r) => r.list),

  getJob: (id: string) => request<import('./types').Job>(`/jobs/${id}`),

  createApplication: (job_id: number) =>
    request<import('./types').Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({ job_id }),
    }),

  getMyApplications: () =>
    request<{ list: import('./types').Application[] }>('/applications/me').then((r) => r.list),

  getRecommendations: () =>
    request<import('./types').RecommendResult>('/recommendations'),
}
