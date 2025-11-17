import Joi from 'joi'

const shippingAdressSchema = new Joi.object({
    city: Joi.string().min(4).max(100).required().empty().messages({
        "string.base": "campo city precisa ser caracteres",
        "string.required": "o campo city precisa ser preenchido!",
        "string.empty": "o campo city precisa ser preenchido!",
        "string.min": "o minimo de caracteres do campo city deve ser 4",
        "string.max": "o maximo de caracteres do campo city deve ser 100"
    }),
    cordenadas: Joi.string().min(4).max(100).required().empty().messages({
        "string.base": "campo cordenadas deve ser caracteres",
        "string.required": "o campo cordenadas deve ser preenchido!",
        "string.empty": "o campo cordenadas deve ser preenchido!",
        "string.min": "o minimo de caracteres do campo city deve ser 4",
        "string.max": "o maximo de caracteres do campo city deve ser 100"
    })
})
export default shippingAdressSchema