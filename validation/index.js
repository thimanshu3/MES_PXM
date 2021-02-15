const Joi = require('joi')

const addCollegeSchema = Joi.object({
    name: Joi.string().min(1).required(),
    address: Joi.string().min(1).required(),
    website: Joi.string().min(1).required(),
    directorName: Joi.string().min(1).required(),
    directorEmail: Joi.string().email().required(),
    directorContactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    spocFirstName: Joi.string().min(1).required(),
    spocLastName: Joi.string().min(1).required(),
    spocEmail: Joi.string().email().required(),
    spocContactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    spocGender: Joi.string().min(1).max(6).equal('male', 'female', 'other').required(),
    spocAlternateEmail: Joi.string().email().allow(''),
    spocGithubUrl: Joi.string().allow(''),
    spocLinkedinUrl: Joi.string().allow('')
})

const addFacultySchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    contactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    gender: Joi.string().min(1).max(6).equal('male', 'female', 'other').required(),
    alternateEmail: Joi.string().email().allow(''),
    githubUrl: Joi.string().allow(''),
    linkedinUrl: Joi.string().allow(''),
    specialization: Joi.string().min(1).required(),
    college: Joi.string().min(1).required()
})

const addStudentSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    contactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    gender: Joi.string().min(1).max(6).equal('male', 'female', 'other').required(),
    alternateEmail: Joi.string().email().allow(''),
    githubUrl: Joi.string().allow(''),
    linkedinUrl: Joi.string().allow(''),
    specialization: Joi.string().min(1).required(),
    college: Joi.string().min(1).required(),
    enrollmentYear: Joi.number().min(2000).max(3000).required(),
    semester: Joi.number().min(1).max(8).required()
})

const updateCollegeSchema = Joi.object({
    name: Joi.string().min(1).required(),
    address: Joi.string().min(1).required(),
    website: Joi.string().min(1).required(),
    directorName: Joi.string().min(1).required(),
    directorEmail: Joi.string().email().required(),
    directorContactNumber: Joi.number().min(1000000000).max(9999999999).required()
})

const updateSpocSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    contactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    githubUrl: Joi.string().allow(''),
    linkedinUrl: Joi.string().allow(''),
})

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().min(8).max(32).required(),
    newPassword: Joi.string().min(8).max(32).required(),
    confirmPassword: Joi.string().min(8).max(32).required()
})

const resetPasswordSchema = Joi.object({
    code: Joi.string().min(1).max(8).required(),
    newPassword: Joi.string().min(8).max(32).required(),
    confirmPassword: Joi.string().min(8).max(32).required()
})

const updateUserProfileSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    contactNumber: Joi.number().min(1000000000).max(9999999999).required(),
    gender: Joi.string().min(1).max(6).equal('male', 'female', 'other').required(),
    alternateEmail: Joi.string().email().allow(''),
    githubUrl: Joi.string().allow(''),
    linkedinUrl: Joi.string().allow('')
})

const addCourseSchema = Joi.object({
    specializationId: Joi.string().min(1).required(),
    iceCourseCode: Joi.string().min(1).required(),
    ilorCode: Joi.string().min(1).required(),
    name: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    semester: Joi.number().min(1).max(8).required()
})

const addTopicSchema = Joi.object({
    name: Joi.string().min(1).required(),
    outcome: Joi.string().min(1).required(),
    objectResourceId: Joi.string().min(1).required(),
    duration: Joi.number().min(1).required()
})

module.exports = {
    addCollegeSchema,
    addFacultySchema,
    addStudentSchema,
    updateCollegeSchema,
    updateSpocSchema,
    changePasswordSchema,
    resetPasswordSchema,
    updateUserProfileSchema,
    addCourseSchema,
    addTopicSchema
}