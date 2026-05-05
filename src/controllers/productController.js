const productService = require('../services/productService');
const { sendSuccess } = require('../utils/responseUtils');

const getAllProducts = async (req, res, next) => {
  try {
    const { category, page, limit } = req.query;
    const result = await productService.getAllProducts({ category, page, limit });
    return sendSuccess(res, 200, 'Products retrieved', result);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, 200, 'Product retrieved', { product });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, 201, 'Product created', { product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, 200, 'Product updated', { product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return sendSuccess(res, 200, 'Product deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
