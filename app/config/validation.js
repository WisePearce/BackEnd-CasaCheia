import Joi from "joi";

// Schema de validação dos campos do user
const userDataValidation = Joi.object({
  name: Joi.string()
    .min(5)
    .max(50)
    .required()
    .messages({
      "string.base": "O nome deve ser um texto.",
      "string.empty": "O nome é obrigatório.",
      "string.min": "O nome deve ter no mínimo 5 caracteres.",
      "string.max": "O nome deve ter no máximo 50 caracteres."
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "O email deve ser válido.",
      "any.required": "O email é obrigatório."
    }),

  telefone: Joi.string()
    .pattern(/^[0-9]{9}$/) // 9 dígitos (ex: Angola)
    .required()
    .messages({
      "string.pattern.base": "O telefone deve ter 9 dígitos numéricos.",
      "any.required": "O telefone é obrigatório."
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "A senha deve ter no mínimo 8 caracteres.",
      "any.required": "A senha é obrigatória."
    })
})

export default userDataValidation