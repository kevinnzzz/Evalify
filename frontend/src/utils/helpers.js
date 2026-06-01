// Validation utilities
export const validate = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Invalid email address',
  required: (v, label = 'This field') => v?.trim() ? '' : `${label} is required`,
  minLength: (v, n, label = 'This field') =>
    v?.length >= n ? '' : `${label} must be at least ${n} characters`,
  passwordMatch: (a, b) => a === b ? '' : 'Passwords do not match',
}

// Format utilities
export const fmt = {
  initials: (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
  scoreColor: (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-500'
  },
  scoreBg: (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-600'
  },
  scoreGradient: (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-500'
    if (score >= 60) return 'from-yellow-400 to-orange-500'
    return 'from-red-400 to-rose-500'
  },
}

// Sleep utility for mock delays
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
