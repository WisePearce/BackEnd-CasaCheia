import Joi from "joi";
const updateSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.base': 'O nome deve ser um texto.',
      'string.empty': 'O nome não pode estar vazio.',
      'string.min': 'O nome deve ter pelo menos {#limit} caracteres.',
      'string.max': 'O nome deve ter no máximo {#limit} caracteres.',
    }),

  telefone: Joi.string()
    .pattern(/^[0-9+\s-]{8,20}$/)
    .optional()
    .messages({
      'string.base': 'O telefone deve ser um texto.',
      'string.empty': 'O telefone não pode estar vazio.',
      'string.pattern.base':
        'O telefone deve conter apenas números, espaços, traços ou o símbolo "+", com entre 8 e 20 caracteres.',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .optional()
    .messages({
      'string.base': 'A nova senha deve ser um texto.',
      'string.empty': 'A nova senha não pode estar vazia.',
      'string.min': 'A nova senha deve ter pelo menos {#limit} caracteres.',
      'string.max': 'A nova senha deve ter no máximo {#limit} caracteres.',
    }),

  currentPassword: Joi.string()
    .min(8)
    .max(128)
    .optional()
    .messages({
      'string.base': 'A senha atual deve ser um texto.',
      'string.empty': 'A senha atual não pode estar vazia.',
      'string.min': 'A senha atual deve ter pelo menos {#limit} caracteres.',
      'string.max': 'A senha atual deve ter no máximo {#limit} caracteres.',
    }),
})

export default updateSchema
