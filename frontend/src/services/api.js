/**
 * Centralized API Service for LabourLink
 * Communicates with the Express.js backend (/api)
 * Automatically attaches JWT token from localStorage to all protected requests.
 */

const API_BASE = '/api';

/** Read the stored JWT token */
const getToken = () => localStorage.getItem('LL_TOKEN');

async function request(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    // If token expired / invalid, clear session and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('LL_TOKEN');
      localStorage.removeItem('LL_REACT_SESSION');
      window.location.href = '/auth';
    }
    throw new Error(data.msg || data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth (these don't require a token)
  login: (role, identifier, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ role, identifier, password }) }),

  register: (role, formData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ role, ...formData }) }),

  demoLogin: (role) =>
    request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),

  // Users
  getUsers: (role) =>
    request(role ? `/users?role=${role}` : '/users'),

  getUser: (id) =>
    request(`/users/${id}`),

  updateUser: (id, updates) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  deleteUser: (id) =>
    request(`/users/${id}`, { method: 'DELETE' }),

  // Services & Quotes
  getServices: () =>
    request('/services'),

  getQuote: (quoteParams) =>
    request('/pricing/quote', { method: 'POST', body: JSON.stringify(quoteParams) }),

  // Bookings
  getBookings: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(query ? `/bookings?${query}` : '/bookings');
  },

  createBooking: (bookingData) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),

  verifyOtp: (bookingId, otp) =>
    request(`/bookings/${bookingId}/verify-otp`, { method: 'PUT', body: JSON.stringify({ otp }) }),

  // Disputes
  getDisputes: () =>
    request('/disputes'),

  createDispute: (disputeData) =>
    request('/disputes', { method: 'POST', body: JSON.stringify(disputeData) }),

  resolveDispute: (disputeId, outcome) =>
    request(`/disputes/${disputeId}/resolve`, { method: 'PUT', body: JSON.stringify({ outcome }) }),

  // Escrow & Finance
  getEscrowLedger: () =>
    request('/escrow/ledger'),

  requestPayout: (labourId, amount) =>
    request('/escrow/payout', { method: 'POST', body: JSON.stringify({ labourId, amount }) })
};
