const Joi = require('joi')

const addUserSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    contactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    gender: Joi.string().min(1).max(6).equal('male', 'female', 'other').required(),
    role: Joi.number().min(0).max(2).required() 
})

module.exports = {
    addUserSchema,
}