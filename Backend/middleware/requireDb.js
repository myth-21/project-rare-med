import { isDbConnected } from '../config/db.js';

export const requireDb = (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      message: 'Database is not connected. Check MongoDB and restart the backend.',
    });
  }
  next();
};

export default requireDb;
