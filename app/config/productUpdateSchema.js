import Joi from 'joi';
const productUpdateValidation = Joi.object({
  name: Joi.string()
    .min(4)
    .max(50)
    .optional()
    .messages({
      "string.base": `"name" deve ser um texto`,
      "string.empty": `"campo nome não pode ser vazio`,
      "string.min": `"name" deve ter pelo menos {4} caracteres`,
      "string.max": `"name" deve ter no máximo {50} caracteres`,
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      "number.base": "price deve ser um número",
      "number.positive": "price deve ser maior que zero",
    }),

  category: Joi.string()
    .max(255)
    .optional()
    .empty()
    .messages({
      "string.base": "categoria deve ser um texto" ,
      "string.empty": "campo categoria deve ser preenchido"
    }),

  stock: Joi.number()
    .optional()
    .integer()
    .empty()
    .min(0)
    .messages({
      "number.base": "stock deve ser um número inteiro",
      "number.min": "stock não pode ser negativo",
      "number.empty": "campo stock deve ser preenchido",
    }),

  description: Joi.string()
    .optional()
    .max(255)
    .messages({
      "string.base": "description deve ser um texto",
      "string.empty": "campo descrição deve ser preenchido "
    })
});

export default productUpdateValidation