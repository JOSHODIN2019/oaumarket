const SESSION_KEY = 'sm_session'
const ADMIN_SESSION_KEY = 'sm_admin_session'

// Real session: a JWT issued by the backend plus the user fields it
// carried at login/register time. Replaces the old localStorage-only
// "registered emails" list that never checked a real password.
export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getAdminSession() {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}
