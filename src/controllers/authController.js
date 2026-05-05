const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, 201, 'Registration successful', { user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    return sendSuccess(res, 200, 'Tokens refreshed', tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User profile', { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };
