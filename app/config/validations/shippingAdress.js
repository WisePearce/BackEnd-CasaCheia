import Joi from 'joi'

const shippingAddressSchema = Joi.object({
  contactName: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Nome de contacto é obrigatório',
      'string.min': 'Nome de contacto deve ter pelo menos 3 caracteres'
    }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9+\s()-]{7,20}$/)
    .required()
    .min(9)
    .max(9)
    .messages({
      'string.empty': 'Número de telefone é obrigatório',
      'string.pattern.base': 'Número de telefone inválido',
      'string.min': 'Número de telefone deve ter 9 caracteres',
      'string.max': 'Número de telefone deve ter 9 caracteres no maximo'
    }),

  street: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.empty': 'Rua é obrigatória'
    }),

  city: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.empty': 'Cidade é obrigatória'
    }),

  coordinates: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
  }).required().messages({
    'any.required': 'Coordenadas são obrigatórias'
  })
});

export default shippingAddressSchema;