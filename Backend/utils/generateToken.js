import jwt from 'jsonwebtoken';
import log from './logger.js';

const generateToken = (subject) => {
  const token = jwt.sign({
    id: subject._id || subject.id,
    email: subject.email,
    isAdmin: Boolean(subject.isAdmin),
  }, process.env.JWT_SECRET || 'raremed_dev_secret', {
    expiresIn: '7d',
  });
  log.info(`[Auth][JWT] JWT generation result success userId=${subject._id || subject.id} email=${subject.email}`);
  return token;
};

export default generateToken;
