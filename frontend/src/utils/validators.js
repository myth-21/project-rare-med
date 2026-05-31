export const passwordStrength = (password = '') => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return ['weak', 'medium', 'strong'][Math.max(score - 1, 0)] || 'weak';
};

export const isEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
