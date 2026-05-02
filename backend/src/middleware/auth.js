const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing bearer token.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireRole(...roles) {
  const normalized = roles.map((r) => String(r || '').toUpperCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    if (!normalized.includes(String(req.user.role || '').toUpperCase())) {
      return res.status(403).json({ message: 'Forbidden for this role.' });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
  JWT_SECRET,
};
