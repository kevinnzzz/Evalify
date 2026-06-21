const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'evalify_secret_key_change_in_production';

/**
 * authenticate – Verifikasi Bearer JWT dari Authorization header.
 * Menyimpan decoded payload ke req.user.
 * JWT payload sekarang berisi: { sub, username, email, role }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader) {
    console.error('[AUTH] ❌ No Authorization header found');
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.error('[AUTH] ❌ Authorization header malformed');
    return res.status(401).json({ error: 'Authorization header must start with "Bearer ".' });
  }

  const token = authHeader.slice(7);
  try {
    console.log('[AUTH] 🔍 Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] ✅ Token verified for user:', decoded.sub, '| role:', decoded.role);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH] ❌ Token verification failed:', {
      error: err.message,
      name: err.name,
      expiredAt: err.expiredAt,
    });
    return res.status(401).json({
      error: 'Token invalid or expired.',
      details: err.message,
    });
  }
}

/**
 * authorizeAdmin – Middleware RBAC untuk route admin.
 * Harus digunakan SETELAH authenticate.
 * Hanya user dengan role 'admin' yang dapat mengakses.
 */
function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    console.warn('[AUTH] 🚫 Forbidden: User', req.user.sub, 'dengan role', req.user.role, 'mencoba akses admin route');
    return res.status(403).json({
      error: 'Forbidden. Hanya admin yang dapat mengakses endpoint ini.',
    });
  }

  next();
}

module.exports = { authenticate, authorizeAdmin, JWT_SECRET };
