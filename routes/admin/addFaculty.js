const express = require('express')
const bcrypt = require('bcryptjs')
const async = require('async')

const { addFacultySchema } = require('../../validation')
const { College, User, Specialization } = require('../../models')
const { random, sendMail, genNewUserWelcomeTemplate } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    const [Colleges, Specializations] = await async.parallel([
        async () => await College.findAll(),
        async () => await Specialization.findAll()
    ])
    res.render('admin/addFaculty', { User: req.user, Colleges, Specializations })
})

router.post('/', (req, res) => {
    addFacultySchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            const {
                firstName,
                lastName,
                email,
                contactNumber,
                gender,
                alternateEmail,
                githubUrl,
                linkedinUrl,
                specialization,
                college
            } = validatedObj

            const facultyPassword = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
            const facultyPasswordHashed = await bcrypt.hash(facultyPassword, 10)

            const facultyObj = {
                firstName,
                lastName,
                email,
                contactNumber,
                gender,
                specialization,
                college,
                role: 2,
                password: facultyPasswordHashed
            }

            if (alternateEmail)
                facultyObj.alternateEmail = alternateEmail
            if (githubUrl)
                facultyObj.githubUrl = githubUrl
            if (linkedinUrl)
                facultyObj.linkedinUrl = linkedinUrl

            try {
                const foundCollege = await College.findOne({
                    where: {
                        id: college
                    }
                })

                if (!foundCollege)
                    throw new Error('College Not Found!')

                const faculty = await User.create({
                    ...facultyObj
                })

                if (process.env.NODE_ENV === 'production')
                    sendMail(email, 'Your Credentials for IBM LMS', '', genNewUserWelcomeTemplate(email, facultyPassword))

                req.flash('success', 'Faculty Added Successfully!')
                res.redirect(`/admin/faculties/${faculty.id}`)
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addFaculty')
            }
        })
        .catch(err => {
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addFaculty')
        })
})

module.exports = router