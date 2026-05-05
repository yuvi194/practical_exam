const Joi = require('joi');

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .pattern(/^[a-fA-F0-9]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Invalid product ID format',
            'any.required': 'Product ID is required for each item',
          }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity is required for each item',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Order must contain at least one item',
      'any.required': 'Items are required',
    }),
});

module.exports = { createOrderSchema };
