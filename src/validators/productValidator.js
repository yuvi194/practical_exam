const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    'any.required': 'Product name is required',
  }),
  description: Joi.string().trim().max(2000).optional().default(''),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Stock cannot be negative',
    'any.required': 'Stock is required',
  }),
  category: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Category is required',
  }),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().trim().min(2).max(100).optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createProductSchema, updateProductSchema };
