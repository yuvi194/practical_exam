const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/productValidator');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  productController.deleteProduct
);

module.exports = router;
