import Joi from 'joi'

const paymentMethodSchema = new Joi.object({
    method: Joi.string().required()
        .valid("cashOnDelivery", "express")
        .default("cashOnDelivery").messages({
            "string.required": "precisa informar o metodo de pagamento",
            "any.only": "o metodo de pagamento deve ser express ou cashOnDelivery",
            "string.empty": "precisa informar o metodo de pagamento"
        })
})

export default paymentMethodSchema