const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

const calculateTotal = (items) => {
  return items.reduce((sum, item) => {
    return sum + item.priceAtPurchase * item.quantity;
  }, 0);
};

const createOrder = async (userId, rawItems) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  
    const productIdSet = [...new Set(rawItems.map((i) => i.productId))];
    if (productIdSet.length !== rawItems.length) {
      throw new AppError('Duplicate products in order are not allowed', 400);
    }

    const products = await Product.find({
      _id: { $in: productIdSet },
      isActive: true,
    }).session(session);

    if (products.length !== productIdSet.length) {
      throw new AppError(
        'One or more products not found or unavailable',
        404
      );
    }

    const productMap = Object.fromEntries(
      products.map((p) => [p._id.toString(), p])
    );

    const enrichedItems = rawItems.map((item) => {
      const product = productMap[item.productId];
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          409
        );
      }
      return {
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      };
    });

    const totalAmount = calculateTotal(enrichedItems);

    for (const item of enrichedItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      if (!result) {
        throw new AppError(
          `Stock conflict for product ${item.productId}. Please try again.`,
          409
        );
      }
    }

    const [order] = await Order.create(
      [{ userId, items: enrichedItems, totalAmount }],
      { session }
    );

    await session.commitTransaction();
    return await order.populate('items.productId', 'name category');
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const getUserOrders = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId })
      .populate('items.productId', 'name category')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Order.countDocuments({ userId }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getOrderById = async (orderId, userId, role) => {
  const filter = { _id: orderId };
  if (role !== 'admin') filter.userId = userId;

  const order = await Order.findOne(filter).populate(
    'items.productId',
    'name category'
  );

  if (!order) throw new AppError('Order not found', 404);
  return order;
};

const getAllOrders = async ({ page = 1, limit = 20, status } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders };
