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

    telefone: Joi.string()
        .pattern(/^[0-9]{9}$/) // 9 dígitos (ex: Angola)
        .required()
        .messages({
            "string.pattern.base": "O telefone deve ter 9 dígitos numéricos.",
            "any.required": "O telefone é obrigatório."
        }),
    role: Joi.string().required().valid("user", "admin").default("user").messages({
      "any.required": "campo role deve ser preenchido",
      "any.only": "o campo role deve ser user ou addmin"
    }),

    password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "A senha deve ter no mínimo 8 caracteres.",
            "any.required": "A senha é obrigatória."
        })
})

const emailPasswordValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "O email deve ser válido.",
            "any.required": "O email é obrigatório."
        }),

    password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "A senha deve ter no mínimo 8 caracteres.",
            "any.required": "A senha é obrigatória."
        })
})


const productValidation = Joi.object({
  name: Joi.string()
    .min(4)
    .max(50)
    .required()
    .messages({
      "string.base": `"name" deve ser um texto`,
      "string.empty": `"campo nome não pode ser vazio`,
      "string.min": `"name" deve ter pelo menos {4} caracteres`,
      "string.max": `"name" deve ter no máximo {5} caracteres`,
      "any.required": `"name" é obrigatório`
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": `"price" deve ser um número`,
      "number.positive": `"price" deve ser maior que zero`,
      "any.required": `"price" é obrigatório`
    }),

  category: Joi.string()
    .max(30)
    .required()
    .empty()
    .messages({
      "string.base": `"category" deve ser um texto`,
      "any.required": `"category" é obrigatório`,
      "string.empty": "campo categoria deve ser preenchido"
    }),

  stock: Joi.number()
    .integer()
    .empty()
    .min(0)
    .required()
    .messages({
      "number.base": `"stock" deve ser um número inteiro`,
      "number.min": `"stock" não pode ser negativo`,
      "number.empty": "campo stock deve ser preenchido"
    }),

  description: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.base": `"description" deve ser um texto`,
      "any.required": `"description" é obrigatório`
    }),

  image: Joi.string()
    .uri()
    .optional()
    .messages({
      "string.uri": `"image" deve ser uma URL válida`
    })
});



export  {userDataValidation, emailPasswordValidation, productValidation}