/**
 * Authenticated fetch — automatically adds x-user-id header from localStorage.
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  try {
    const stored = localStorage.getItem("auth-user")
    if (stored) {
      const user = JSON.parse(stored)
      if (user?.id) headers.set("x-user-id", user.id)
    }
  } catch {}
  return fetch(url, { ...options, headers })
}
