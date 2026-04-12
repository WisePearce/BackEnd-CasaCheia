import Joi from 'joi';

const createBannerSchema = Joi.object({
  images: Joi.string().required().messages({
    'string.base': 'imagem deve ser uma string',
    'any.required': 'imagem para banner é obrigatória',
  }),
  description: Joi.string().required().optional().messages({
    'string.base': 'descrição deve ser uma string',
  }),

  active: Joi.boolean().default(true),
});

const updateBannerSchema = Joi.object({
  images: Joi.string().messages({
    'string.base': 'imageUrl deve ser uma string',
  }),
  description: Joi.string().required().optional().messages({
    'string.base': 'descrição deve ser uma string',
  }),
  active: Joi.boolean(),
}).min(1);

export {
  createBannerSchema,
  updateBannerSchema,
}