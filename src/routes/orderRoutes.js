const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validators/orderValidator');

// All order routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin-only
router.get('/', roleMiddleware('admin'), orderController.getAllOrders);

module.exports = router;
