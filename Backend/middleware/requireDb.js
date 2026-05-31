import { isDbConnected, reconnectDB } from '../config/db.js';

export const requireDb = async (req, res, next) => {
  if (isDbConnected()) {
    return next();
  }

  const result = await reconnectDB();
  if (result.connected) {
    return next();
  }

  return res.status(503).json({
    message: 'Database is not connected. Check MongoDB Atlas access and MONGO_URI, then redeploy or restart the backend.',
  });
};

export default requireDb;
