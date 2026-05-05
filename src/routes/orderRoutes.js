const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validators/orderValidator');

router.use(authMiddleware);


router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);


router.get('/', roleMiddleware('admin'), orderController.getAllOrders);

module.exports = router;
