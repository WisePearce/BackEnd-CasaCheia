import Joi from "joi"

const categorieUpdateValidation = Joi.object({
  name: Joi.string()
    .min(4)
    .max(50)
    .required()
    .optional()
    .messages({
      "string.base": `nome deve ser um texto`,
      "string.empty": `"campo nome não pode ser vazio`,
      "string.min": `nome deve ter pelo menos 4 caracteres`,
      "string.max": `nome deve ter no máximo 50 caracteres`,
      "any.required": `nome é obrigatório`
    }),

  description: Joi.string()
    .max(255)
    .required()
    .optional()
    .messages({
      "string.base": `descricacao deve ser um texto`,
      "any.required": `descricacao é obrigatório`,
      "string.empty": "campo descrição deve ser preenchido " 
    })
})

export default categorieUpdateValidation
