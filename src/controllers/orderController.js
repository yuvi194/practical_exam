const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/responseUtils');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body.items);
    return sendSuccess(res, 201, 'Order placed successfully', { order });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await orderService.getUserOrders(req.user.id, { page, limit });
    return sendSuccess(res, 200, 'Orders retrieved', result);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, 200, 'Order retrieved', { order });
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await orderService.getAllOrders({ page, limit, status });
    return sendSuccess(res, 200, 'All orders retrieved', result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders };
