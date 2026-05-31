import jwt from 'jsonwebtoken';

const generateToken = (subject) =>
  jwt.sign({
    id: subject._id || subject.id,
    email: subject.email,
    isAdmin: Boolean(subject.isAdmin),
  }, process.env.JWT_SECRET || 'raremed_dev_secret', {
    expiresIn: '7d',
  });

export default generateToken;
