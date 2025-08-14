import Joi from 'joi';

export const simulationSchema = Joi.object({
  availableDrivers: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      'number.base': 'Available drivers must be a number',
      'number.integer': 'Available drivers must be an integer',
      'number.min': 'Available drivers must be at least 1',
      'number.max': 'Available drivers cannot exceed 50',
      'any.required': 'Available drivers is required'
    }),
  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM format (24-hour)',
      'any.required': 'Start time is required'
    }),
  maxHoursPerDay: Joi.number()
    .integer()
    .min(1)
    .max(24)
    .required()
    .messages({
      'number.base': 'Max hours per day must be a number',
      'number.integer': 'Max hours per day must be an integer',
      'number.min': 'Max hours per day must be at least 1',
      'number.max': 'Max hours per day cannot exceed 24',
      'any.required': 'Max hours per day is required'
    })
});
