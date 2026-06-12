import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import log from '../utils/logger.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email) => {
  return String(email).trim().toLowerCase();
};

export const validateEmail = (email) => {
  return EMAIL_REGEX.test(String(email).trim().toLowerCase());
};

export const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const createUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: false,
  profilePicture: user.profilePicture || null,
  createdAt: user.createdAt,
});

export const registerUser = async ({ name, email, password, confirmPassword }) => {
  if (!name || !email || !password || !confirmPassword) {
    const error = new Error('All fields are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  if (!validateEmail(normalizedEmail)) {
    const error = new Error('Please enter a valid email address.');
    error.statusCode = 400;
    throw error;
  }

  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  log.info(`[Auth][Register] email=${normalizedEmail} existingUser=${Boolean(existingUser)} userId=${existingUser?._id} googleId=${existingUser?.googleId || 'none'} passwordExists=${Boolean(existingUser?.password)} db=${User.db.name} collection=${User.collection.name} uri=${process.env.MONGO_URI || 'unknown'}`);

  if (existingUser) {
    if (existingUser.googleId && !existingUser.password) {
      const error = new Error('This account was created using Google Sign-In. Please use Google Login.');
      error.statusCode = 400;
      throw error;
    }

    const error = new Error('This email is already registered.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email: normalizedEmail, password });
  return {
    user: createUserPayload(user),
    token: createToken(user._id),
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  if (!validateEmail(normalizedEmail)) {
    const error = new Error('Please enter a valid email address.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: normalizedEmail });
  log.info(`[Auth][Login] email=${normalizedEmail} found=${Boolean(user)} userId=${user?._id} googleId=${user?.googleId || 'none'} passwordExists=${Boolean(user?.password)} db=${User.db.name} collection=${User.collection.name} uri=${process.env.MONGO_URI || 'unknown'}`);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.password) {
    if (user.googleId) {
      const error = new Error('This account was created using Google Sign-In. Please use Google Login.');
      error.statusCode = 401;
      throw error;
    }
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await user.matchPassword(password);
  log.info(`[Auth][Login] passwordHashExists=${Boolean(user.password)} passwordMatchResult=${passwordMatch} userId=${user._id} email=${normalizedEmail}`);

  if (!passwordMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: createUserPayload(user),
    token: createToken(user._id),
  };
};

export const findOrCreateGoogleUser = async ({ id: googleId, displayName, emails, photos }) => {
  const email = normalizeEmail(emails?.[0]?.value || '');
  if (!validateEmail(email)) {
    const error = new Error('Please enter a valid email address.');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ $or: [{ googleId }, { email }] });
  let user = existingUser;

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.profilePicture = photos?.[0]?.value || user.profilePicture;
      await user.save();
    }
  } else {
    user = await User.create({
      name: displayName || email.split('@')[0],
      email,
      googleId,
      profilePicture: photos?.[0]?.value || null,
    });
  }

  return {
    user: createUserPayload(user),
    token: createToken(user._id),
  };
};
