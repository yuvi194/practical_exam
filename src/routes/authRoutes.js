const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require('../validators/authValidator');

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);

router.post('/logout', authMiddleware, authController.logout);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
