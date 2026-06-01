const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'evalify_secret_key_change_in_production';

/**
 * Protect route – verifies Bearer JWT from Authorization header.
 * Attaches decoded payload to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader) {
    console.error('[AUTH] ❌ No Authorization header found');
    console.error('[AUTH] Headers:', Object.keys(req.headers));
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.error('[AUTH] ❌ Authorization header malformed:', authHeader.substring(0, 20) + '...');
    return res.status(401).json({ error: 'Authorization header must start with "Bearer ".' });
  }

  const token = authHeader.slice(7);
  try {
    console.log('[AUTH] 🔍 Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] ✅ Token verified for user:', decoded.sub);
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

module.exports = { authenticate, JWT_SECRET };
