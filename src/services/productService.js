const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

const getAllProducts = async ({ category, page = 1, limit = 20 } = {}) => {
  const filter = { isActive: true };
  if (category) filter.category = new RegExp(category, 'i');

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (id) => {
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  product.isActive = false;
  await product.save();
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
