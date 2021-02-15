const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const async = require('async')

const { MySql } = require('../../db')
const { College, User } = require('../../models')
const { addCollegeSchema } = require('../../validation')
const { random, sendMail, genNewUserWelcomeTemplate } = require('../../util')

const collegeLogoStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads/collegeLogo'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const imageFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const collegeLogoUpload = multer({
    storage: collegeLogoStorage,
    fileFilter: imageFilter
})

const router = express.Router()

router.get('/', async (req, res) => {
    const [colleges, spocs] = await async.parallel([
        async () => await College.findAll({
            attributes: ['id', 'name']
        }),
        async () => await User.findAll({
            where: {
                role: 1
            },
            attributes: [
                'id',
                'email',
                'contactNumber'
            ]
        })
    ])
    res.render('admin/addCollege', { User: req.user, colleges, spocs })
})

router.post('/', collegeLogoUpload.single('logoSource'), (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/addCollege')
        return
    }
    addCollegeSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            const {
                name,
                address,
                website,
                directorName,
                directorEmail,
                directorContactNumber,
                spocEmail,
                spocContactNumber,
                spocFirstName,
                spocLastName,
                spocGender,
                spocAlternateEmail,
                spocGithubUrl,
                spocLinkedinUrl
            } = validatedObj

            if (directorEmail === spocEmail) {
                req.flash('error', 'Director & SPoC Email cannot be same!')
                res.redirect('/admin/addCollege')
                return
            }

            if (directorContactNumber === spocContactNumber) {
                req.flash('error', 'Director & SPoC Contact Number cannot be same!')
                res.redirect('/admin/addCollege')
                return
            }

            const spocPassword = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
            const spocPasswordHashed = await bcrypt.hash(spocPassword, 10)

            const collegeObj = {
                name,
                address,
                website,
                directorName,
                directorEmail,
                directorContactNumber,
                logoSource: req.file ? req.file.filename : undefined
            }
            const spocObj = {
                email: spocEmail,
                password: spocPasswordHashed,
                role: 1,
                contactNumber: spocContactNumber,
                firstName: spocFirstName,
                lastName: spocLastName,
                gender: spocGender
            }

            if (spocAlternateEmail)
                spocObj.alternateEmail = spocAlternateEmail
            if (spocGithubUrl)
                spocObj.githubUrl = spocGithubUrl
            if (spocLinkedinUrl)
                spocObj.linkedinUrl = spocLinkedinUrl

            let transaction

            try {
                transaction = await MySql.transaction()

                const college = await College.create({
                    ...collegeObj
                }, {
                    transaction
                })

                await User.create({
                    ...spocObj,
                    college: college.id
                }, {
                    transaction
                })

                await transaction.commit()

                if (process.env.NODE_ENV === 'production')
                    sendMail(spocEmail, 'Your Credentials for IBM LMS', '', genNewUserWelcomeTemplate(spocEmail, spocPassword))

                req.flash('success', 'College Added Successfully!')
                res.redirect(`/admin/colleges/${college.id}`)
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (req.file && req.file.filename)
                    fs.unlink(`uploads/collegeLogo/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
                if (transaction)
                    await transaction.rollback()
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addCollege')
            }
        })
        .catch(err => {
            if (req.file && req.file.filename)
                fs.unlink(`uploads/collegeLogo/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addCollege')
        })
})

module.exports = router