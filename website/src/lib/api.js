// ── Cliente API centralizado ──────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || '/api';

let accessToken = null;

function setToken(t) { accessToken = t; }
function clearToken() { accessToken = null; }
function getToken() { return accessToken; }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });

  // Auto-refresh si 401
  if (res.status === 401 && accessToken && !path.startsWith('/auth')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      return fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });
    }
  }

  return res;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST', credentials: 'include',
    });
    if (!res.ok) { clearToken(); return false; }
    const { accessToken: t } = await res.json();
    setToken(t);
    return true;
  } catch {
    clearToken();
    return false;
  }
}

// ── Blog público ──────────────────────────────────────────────────────
export const blogApi = {
  list: (page = 1, limit = 10, tag) => {
    const params = new URLSearchParams({ page, limit });
    if (tag) params.set('tag', tag);
    return request(`/blog?${params}`);
  },
  get: (slug) => request(`/blog/${slug}`),
};

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
      return { ok: true };
    }
    const { error } = await res.json();
    return { ok: false, error };
  },

  logout: async () => {
    await request('/auth/logout', { method: 'POST' });
    clearToken();
  },

  refresh: tryRefresh,
  isLoggedIn: () => !!accessToken,
};

// ── Blog admin ────────────────────────────────────────────────────────
export const adminApi = {
  list: (status) => {
    const params = status ? `?status=${status}` : '';
    return request(`/blog/admin/all${params}`);
  },
  get:       (id)  => request(`/blog/admin/${id}`),
  update:    (id, data) => request(`/blog/admin/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
  publish:   (id)  => request(`/blog/admin/${id}/publish`,   { method: 'POST' }),
  unpublish: (id)  => request(`/blog/admin/${id}/unpublish`, { method: 'POST' }),
  delete:    (id)  => request(`/blog/admin/${id}`, { method: 'DELETE' }),
};
