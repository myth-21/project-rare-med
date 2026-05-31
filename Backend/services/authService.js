import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
  if (existingUser) {
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
  if (!user || !(await user.matchPassword(password))) {
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
