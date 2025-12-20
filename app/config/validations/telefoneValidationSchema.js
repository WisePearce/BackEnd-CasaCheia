import Joi from "joi";
const telefoneValidationSchema = Joi.object({
  telefone: Joi.string()
    .min(9)
    .max(9)
    .required()
    .empty()
    .messages({
      "string.base": "O campo telefone deve ser uma string",
      "string.empty": "O campo telefone não pode estar vazio",
      "string.min": "O campo telefone deve ter no mínimo 9 caracteres",
      "string.max": "O campo telefone deve ter no máximo 9 caracteres",
      "any.required": "O campo telefone é obrigatório"
    })
});

export default telefoneValidationSchema;