import Joi from "joi"

const changePassword = Joi.object({

    currentPassword: Joi.string().required().min(8).messages({
        "string.empty": "informe a sua password atual",
        "string.min": "a password deve ter no minimo 8 caracteres"
    }),
    newPassword: Joi.string().required().min(8).messages({
        "string.empty": "informe a a nova senha",
        "string.min": "a nova senha deve ter no minimo 8 caracteres"
    })

})

export default changePassword