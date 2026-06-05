import jwt from 'jsonwebtoken';

const adminAuthMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'raremed_dev_secret');
    const envAdminEmail = String(process.env.ADMIN_EMAIL || '').toLowerCase();
    const tokenEmail = String(decoded.email || '').toLowerCase();

    if (!decoded.isAdmin || decoded.type !== 'admin' || !envAdminEmail || tokenEmail !== envAdminEmail) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.admin = {
      email: decoded.email,
      isAdmin: true,
    };
    req.user = {
      _id: 'env-admin',
      id: 'env-admin',
      name: 'Rare Med Admin',
      email: decoded.email,
      isAdmin: true,
      isActive: true,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

export default adminAuthMiddleware;
