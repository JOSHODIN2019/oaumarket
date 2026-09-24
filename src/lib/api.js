const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Every call returns { status: 'success', data } | { status: 'not-found' } |
// { status: 'network-error' } | { status: 'server-error', message } - the
// same discriminated-result shape everywhere, so every caller handles
// failure the same way instead of throwing surprises.
async function request(path, init) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    return { status: 'network-error' }
  }
  if (response.status === 404) {
    return { status: 'not-found' }
  }
  if (response.status === 401) {
    return { status: 'unauthorized' }
  }
  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`
    try {
      const body = await response.json()
      if (body.message) message = Array.isArray(body.message) ? body.message.join(' ') : body.message
    } catch {
      // fall back to the generic status-based message above
    }
    return { status: 'server-error', message }
  }
  if (response.status === 204) {
    return { status: 'success', data: undefined }
  }
  try {
    const data = await response.json()
    return { status: 'success', data }
  } catch {
    return { status: 'server-error', message: "Received an unexpected response - is the backend running?" }
  }
}

function withJsonBody(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function withAuth(accessToken, init = {}) {
  return {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${accessToken}` },
  }
}

// ---- Auth ----
export const checkMatric = (matricNumber) => request('/auth/check-matric', withJsonBody('POST', { matricNumber }))
export const registerUser = (payload) => request('/auth/register', withJsonBody('POST', payload))
export const loginUser = (payload) => request('/auth/login', withJsonBody('POST', payload))
export const fetchMe = (accessToken) => request('/auth/me', withAuth(accessToken))

// ---- Categories ----
export const fetchCategories = () => request('/categories')

// ---- Products ----
export const fetchProducts = (categoryId) =>
  request(`/products${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''}`)
export const fetchProductsBySeller = (sellerId) => request(`/products?sellerId=${encodeURIComponent(sellerId)}`)
export const fetchProductById = (id) => request(`/products/${encodeURIComponent(id)}`)
export const createProduct = (payload) => request('/products', withJsonBody('POST', payload))
export const updateProduct = (id, payload) => request(`/products/${encodeURIComponent(id)}`, withJsonBody('PATCH', payload))
export const deleteProduct = (id, actorId) =>
  request(`/products/${encodeURIComponent(id)}?actorId=${encodeURIComponent(actorId)}`, { method: 'DELETE' })

// ---- Messages ----
export const sendMessage = (payload) => request('/messages', withJsonBody('POST', payload))
export const fetchConversation = (productId, buyerId, sellerId, viewerId) => {
  const params = new URLSearchParams({ productId, buyerId, sellerId })
  if (viewerId) params.set('viewerId', viewerId)
  return request(`/messages/conversation?${params.toString()}`)
}
export const fetchInbox = (userId) => request(`/messages/inbox?userId=${encodeURIComponent(userId)}`)

// ---- Transactions ----
export const createTransaction = (payload) => request('/transactions', withJsonBody('POST', payload))
export const fetchTransaction = (id) => request(`/transactions/${encodeURIComponent(id)}`)
export const fetchTransactionsForUser = (userId) => request(`/transactions?userId=${encodeURIComponent(userId)}`)
export const updateTransactionStatus = (id, status, actorId) =>
  request(`/transactions/${encodeURIComponent(id)}/status`, withJsonBody('PATCH', { status, actorId }))

// ---- Offers ----
export const createOffer = (payload) => request('/offers', withJsonBody('POST', payload))
export const fetchOffersForUser = (userId) => request(`/offers?userId=${encodeURIComponent(userId)}`)
export const acceptOffer = (id, actorId) => request(`/offers/${encodeURIComponent(id)}/accept`, withJsonBody('PATCH', { actorId }))
export const declineOffer = (id, actorId) => request(`/offers/${encodeURIComponent(id)}/decline`, withJsonBody('PATCH', { actorId }))
export const withdrawOffer = (id, actorId) => request(`/offers/${encodeURIComponent(id)}/withdraw`, withJsonBody('PATCH', { actorId }))

// ---- Favorites ----
export const fetchFavorites = (userId) => request(`/favorites/${encodeURIComponent(userId)}`)
export const saveFavorite = (userId, productId) => request('/favorites', withJsonBody('POST', { userId, productId }))
export const removeFavorite = (userId, productId) =>
  request(`/favorites?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`, { method: 'DELETE' })

// ---- Notifications ----
export const fetchNotifications = (userId) => request(`/notifications?userId=${encodeURIComponent(userId)}`)
export const markNotificationRead = (id, userId) =>
  request(`/notifications/${encodeURIComponent(id)}/read?userId=${encodeURIComponent(userId)}`, { method: 'PATCH' })
export const markAllNotificationsRead = (userId) =>
  request(`/notifications/read-all?userId=${encodeURIComponent(userId)}`, { method: 'PATCH' })

// ---- Reports ----
export const createReport = (payload) => request('/reports', withJsonBody('POST', payload))

// ---- Users ----
export const fetchPublicUser = (id) => request(`/users/${encodeURIComponent(id)}`)
export const updateMyAvatar = (accessToken, avatarUrl) =>
  request('/users/me/avatar', withAuth(accessToken, withJsonBody('PATCH', { avatarUrl })))
export const updateMyProfile = (accessToken, payload) =>
  request('/users/me', withAuth(accessToken, withJsonBody('PATCH', payload)))

// ---- Admin ----
export const seedDevAdmin = (payload) => request('/admin-auth/seed-dev-admin', withJsonBody('POST', payload))
export const adminLogin = (payload) => request('/admin-auth/login', withJsonBody('POST', payload))
export const fetchAdminSummary = (accessToken) => request('/admin-dashboard/summary', withAuth(accessToken))
export const suspendUser = (accessToken, id) =>
  request(`/admin-moderation/users/${encodeURIComponent(id)}/suspend`, withAuth(accessToken, { method: 'PATCH' }))
export const reinstateUser = (accessToken, id) =>
  request(`/admin-moderation/users/${encodeURIComponent(id)}/reinstate`, withAuth(accessToken, { method: 'PATCH' }))
export const flagTransaction = (accessToken, id, reason) =>
  request(`/admin-moderation/transactions/${encodeURIComponent(id)}/flag`, withAuth(accessToken, withJsonBody('PATCH', { reason })))
export const unflagTransaction = (accessToken, id) =>
  request(`/admin-moderation/transactions/${encodeURIComponent(id)}/unflag`, withAuth(accessToken, { method: 'PATCH' }))
export const fetchAdminTransactions = (accessToken) => request('/admin-transactions', withAuth(accessToken))
export const investigateTransaction = (accessToken, id) =>
  request(`/admin-transactions/${encodeURIComponent(id)}`, withAuth(accessToken))
export const createAdminCategory = (accessToken, payload) =>
  request('/admin-categories', withAuth(accessToken, withJsonBody('POST', payload)))
export const updateAdminCategory = (accessToken, id, payload) =>
  request(`/admin-categories/${encodeURIComponent(id)}`, withAuth(accessToken, withJsonBody('PATCH', payload)))
export const deleteAdminCategory = (accessToken, id) =>
  request(`/admin-categories/${encodeURIComponent(id)}`, withAuth(accessToken, { method: 'DELETE' }))
export const fetchAdminAuditLogs = (accessToken) => request('/admin-audit-logs', withAuth(accessToken))
export const fetchAdminReports = (accessToken) => request('/reports', withAuth(accessToken))
export const resolveReport = (accessToken, id) =>
  request(`/reports/${encodeURIComponent(id)}/resolve`, withAuth(accessToken, { method: 'PATCH' }))
