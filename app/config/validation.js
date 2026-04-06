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
    role: Joi.string().required().valid("user", "admin").default("user").optional().messages({
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

const nameTelefoneValidation = Joi.object({
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
        })
})  

const telefonePasswordValidation = Joi.object({
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
    .max(24)
    .min(24)
    .required()
    .empty()
    .messages({
      "string.base": "informe o id da categoria" ,
      "any.required": "categoria é um campo obrigatório",
      "string.empty": "campo categoria deve ser preenchido",
      "string.min": "id da categoria deve ter 24 caracteres",
      "string.max": "id da categoria deve ter 24 caracteres",
    }),
  partner: Joi.string()
    .max(24)
    .min(24)
    .optional()
    .empty()
    .messages({
      "string.base": "informe o id do partner (parceiro)" ,
      "string.empty": "campo partner deve ser preenchido",
      "string.min": "id do partner deve ter 24 caracteres",
      "string.max": "id do partner deve ter 24 caracteres",
    }),

  stock: Joi.number()
    .integer()
    .empty()
    .min(0)
    .required()
    .messages({
      "number.base": "stock deve ser um número inteiro",
      "number.min": "stock não pode ser negativo",
      "number.empty": "campo stock deve ser preenchido",
      "any.required": "campo stock deve ser preenchido"
    }),

  description: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.base": "description deve ser um texto",
      "any.required": "description é obrigatório",
      "string.empty": "campo descrição deve ser preenchido "
    }),

  image: Joi.string()
    .uri()
    .optional()
    .messages({
      "string.uri": `"image" deve ser uma URL válida`
    })
});

const categoriesValidation = Joi.object({
  name: Joi.string()
    .min(4)
    .max(50)
    .required()
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
    .messages({
      "string.base": `descricacao deve ser um texto`,
      "any.required": `descricacao é obrigatório`,
      "string.empty": "campo descrição deve ser preenchido " 
    })

});

const telefoneValidation = Joi.object({
    telefone: Joi.string()
        .pattern(/^[0-9]{9}$/) // 9 dígitos (ex: Angola)
        .required()
        .empty()
        .messages({
            "string.pattern.base": "O telefone deve ter 9 dígitos numéricos.",
            "any.required": "O telefone é obrigatório.",
            "string.empty": "O telefone não pode ser vazio."
        })
});

const partnerValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .required()
        .messages({
            "string.base": "O nome deve ser um texto.",
            "string.empty": "O nome é obrigatório.",
            "string.min": "O nome deve ter no mínimo 3 caracteres.",
            "string.max": "O nome deve ter no máximo 100 caracteres.",
            "any.required": "O nome é um campo obrigatório."
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            "string.email": "Insira um e-mail válido.",
            "string.empty": "O e-mail é obrigatório.",
            "any.required": "O e-mail é um campo obrigatório."
        }),

    nif: Joi.string()
        .min(9)
        .max(14)
        .uppercase()
        .required()
        .messages({
            "string.min": "O NIF deve ter no mínimo 9 caracteres.",
            "string.max": "O NIF deve ter no máximo 14 caracteres.",
            "any.required": "O NIF é obrigatório."
        }),

    status: Joi.string()
        .valid("active", "inactive", "suspended")
        .default("active")
        .messages({
            "any.only": "O status deve ser active, inactive ou suspended."
        }),

    phone: Joi.string()
        .pattern(/^[0-9]{9}$/) // Padrão 9 dígitos
        .required()
        .messages({
            "string.pattern.base": "O telefone deve ter exatamente 9 dígitos numéricos.",
            "any.required": "O telefone é obrigatório."
        }),

    address: Joi.object({
        street: Joi.string().allow('').optional(),
        city: Joi.string().default("Luanda").optional(),
        province: Joi.string().required().messages({
            "any.required": "A província é obrigatória no endereço."
        })
    }).required()
});


const partnerUpdateValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .messages({
            "string.base": "O nome deve ser um texto.",
            "string.min": "O nome deve ter no mínimo 3 caracteres.",
            "string.max": "O nome deve ter no máximo 100 caracteres."
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .messages({
            "string.email": "Insira um e-mail válido."
        }),

    nif: Joi.string()
        .min(9)
        .max(14)
        .uppercase()
        .messages({
            "string.min": "O NIF deve ter no mínimo 9 caracteres.",
            "string.max": "O NIF deve ter no máximo 14 caracteres."
        }),

    status: Joi.string()
        .valid("active", "inactive", "suspended")
        .messages({
            "any.only": "O status deve ser active, inactive ou suspended."
        }),

    phone: Joi.string()
        .pattern(/^[0-9]{9}$/)
        .messages({
            "string.pattern.base": "O telefone deve ter exatamente 9 dígitos numéricos."
        }),

    address: Joi.object({
        street: Joi.string().allow('').optional(),
        city: Joi.string().optional(),
        province: Joi.string().optional()
    }).optional()
}).min(1); // Garante que pelo menos um campo seja enviado para atualização




export {
  partnerValidation,
  partnerUpdateValidation,
  userDataValidation,
  nameTelefoneValidation,
  telefonePasswordValidation,
  productValidation,
  categoriesValidation,
  telefoneValidation
};