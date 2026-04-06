import Joi from 'joi';

const createStoreValidator = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.base': 'Nome deve ser um texto',
        'string.min': 'Nome deve ter no mínimo 3 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.base': 'Latitude deve ser um número',
        'number.min': 'Latitude mínima é -90',
        'number.max': 'Latitude máxima é 90',
        'any.required': 'Latitude é obrigatória'
      }),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.base': 'Longitude deve ser um número',
        'number.min': 'Longitude mínima é -180',
        'number.max': 'Longitude máxima é 180',
        'any.required': 'Longitude é obrigatória'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

const updateStoreValidator = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .messages({
        'string.base': 'Nome deve ser um texto',
        'string.min': 'Nome deve ter no mínimo 3 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
      }),
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .messages({
        'number.base': 'Latitude deve ser um número',
        'number.min': 'Latitude mínima é -90',
        'number.max': 'Latitude máxima é 90',
      }),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .messages({
        'number.base': 'Longitude deve ser um número',
        'number.min': 'Longitude mínima é -180',
        'number.max': 'Longitude máxima é 180',
      })
  });

  return schema.validate(data, { abortEarly: false });
};

export {
  createStoreValidator,
  updateStoreValidator
}