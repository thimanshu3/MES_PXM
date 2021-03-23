const Joi = require('joi')

const addUserSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    contactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    gender: Joi.string().min(1).max(6).equal('male', 'female', 'other').required(),
    role: Joi.number().min(0).max(2).required()
})

const addInputFieldSchema = Joi.object({
    label: Joi.string().min(1).required(),
    typeOfField: Joi.string().min(1).required(),
    description: Joi.string().min(0).allow('').allow(null),
    createdBy: Joi.string().min(0).allow('').allow(null)

})

const addListRecordSchema = Joi.object({
    name: Joi.string().min(1).required(),
    value: Joi.string().min(1).required()
})

module.exports = {
    addUserSchema,
    addInputFieldSchema,
    addListRecordSchema
}