import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'raremed_dev_secret');
    if (decoded.isAdmin && String(decoded.email || '').toLowerCase() === String(process.env.ADMIN_EMAIL || '').toLowerCase()) {
      req.user = {
        _id: 'env-admin',
        id: 'env-admin',
        name: 'Rare Med Admin',
        email: decoded.email,
        isAdmin: true,
        isActive: true,
        profilePicture: '',
      };
      return next();
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account is disabled' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
};
