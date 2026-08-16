import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireTeacher = requireRole(['teacher']);
export const requireParent = requireRole(['parent']);
export const requireStaff = requireRole(['admin', 'teacher']);
export const requireAssociatedUser = requireRole(['admin', 'teacher', 'parent']);
