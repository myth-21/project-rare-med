import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Authorization token is missing.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User not found.');
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      googleId: user.googleId,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    next();
  } catch (error) {
    res.status(401);
    next(new Error('Not authorized, token invalid.'));
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    return next(new Error('Admin access required.'));
  }
  next();
};
