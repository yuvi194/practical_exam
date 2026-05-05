const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { AppError } = require('../middleware/errorHandler');

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({ name, email, passwordHash });
  return user;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user };
};

const refresh = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token is invalid or has been revoked', 401);
  }

  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

module.exports = { register, login, refresh, logout };
