const express = require('express')
const bcrypt = require('bcryptjs')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')

const { addStudentSchema } = require('../../validation')
const { College, User, Specialization } = require('../../models')
const { random, sendMail, checkArrayUnique, genNewUserWelcomeTemplate } = require('../../util')
const { MySql } = require('../../db')

const uploadStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const excelFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const excelUpload = multer({
    storage: uploadStorage,
    fileFilter: excelFilter
})

const router = express.Router()

router.get('/', async (req, res) => {
    const [Colleges, Specializations] = await async.parallel([
        async () => await College.findAll(),
        async () => await Specialization.findAll()
    ])
    res.render('admin/addStudent', { User: req.user, Colleges, Specializations })
})

router.post('/', (req, res) => {
    addStudentSchema
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
                college,
                enrollmentYear,
                semester
            } = validatedObj

            const studentPassword = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
            const studentPasswordHashed = await bcrypt.hash(studentPassword, 10)

            const studentObj = {
                firstName,
                lastName,
                email,
                contactNumber,
                gender,
                specialization,
                college,
                enrollmentYear,
                semester,
                role: 3,
                password: studentPasswordHashed
            }

            if (alternateEmail)
                studentObj.alternateEmail = alternateEmail
            if (githubUrl)
                studentObj.githubUrl = githubUrl
            if (linkedinUrl)
                studentObj.linkedinUrl = linkedinUrl

            try {
                const foundCollege = await College.findOne({
                    where: {
                        id: college
                    }
                })

                if (!foundCollege)
                    throw new Error('College Not Found!')

                const student = await User.create({
                    ...studentObj
                })

                if (process.env.NODE_ENV === 'production')
                    sendMail(email, 'Your Credentials for IBM LMS', '', genNewUserWelcomeTemplate(email, studentPassword))

                req.flash('success', 'Student Added Successfully!')
                res.redirect(`/admin/students/${student.id}`)

            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addStudent')
            }
        })
        .catch(err => {
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addStudent')
        })
})

router.post('/import', excelUpload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/addStudent')
        return
    }

    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
    excelData.shift()

    if (excelData.length === 0) {
        req.flash('error', 'No Student to Add!')
        res.redirect('/admin/addStudent')
        return
    }

    if (!req.body.specialization) {
        req.flash('error', 'Specialization is required!')
        res.redirect('/admin/addStudent')
        return
    }
    if (!req.body.college) {
        req.flash('error', 'College is required!')
        res.redirect('/admin/addStudent')
        return
    }

    const [foundSpecialization, foundCollege] = await async.parallel([
        async () => await Specialization.findOne({
            where: {
                id: req.body.specialization
            },
            attributes: ['id']
        }),
        async () => await College.findOne({
            where: {
                id: req.body.college
            },
            attributes: ['id']
        })
    ])
    if (!foundSpecialization) {
        req.flash('error', 'Specialization Not Found!')
        res.redirect('/admin/addStudent')
        return
    }
    if (!foundCollege) {
        req.flash('error', 'College Not Found!')
        res.redirect('/admin/addStudent')
        return
    }

    Promise
        .all(excelData.map(async row => {
            try {
                const obj = {
                    firstName: row[1].trim(),
                    lastName: row[2].trim(),
                    email: row[3].trim(),
                    contactNumber: row[4],
                    gender: row[5].trim().toLowerCase(),
                    specialization: req.body.specialization,
                    college: req.body.college,
                    enrollmentYear: row[6],
                    semester: row[7]
                }
                const validatedObj = await addStudentSchema.validateAsync(obj)
                return validatedObj
            } catch (err) {
                throw new Error(err.toString() + ` at Sr. No. ${row[0]} for ${row[3]} !`)
            }
        }))
        .then(async studentsList => {
            const studentEmails = []
            const studentContactNumbers = []

            studentsList.forEach(student => {
                student.role = 3
                studentEmails.push(student.email)
                studentContactNumbers.push(student.contactNumber)
            })

            if (!checkArrayUnique(studentEmails)) {
                req.flash('error', 'All Emails must be Unique!')
                res.redirect('/admin/addStudent')
                return
            }
            if (!checkArrayUnique(studentContactNumbers)) {
                req.flash('error', 'All Contact Numbers should be Unique!')
                res.redirect('/admin/addStudent')
                return
            }

            const passwords = await Promise.all(studentsList.map(async student => {
                const password = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
                const hashedPassword = await bcrypt.hash(password, 10)
                student.password = hashedPassword
                return password
            }))

            let transaction

            try {
                transaction = await MySql.transaction()

                await User.bulkCreate(studentsList, { transaction })
                await transaction.commit()

                if (process.env.NODE_ENV === 'production')
                    passwords.forEach((password, index) => {
                        sendMail(studentEmails[index], 'Your Credentials for IBM LMS', '', genNewUserWelcomeTemplate(studentEmails[index], password))
                    })

                req.flash('success', 'Students Import Successful!')
                res.redirect('/admin/students')
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (transaction)
                    await transaction.rollback()
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addStudent')
            }
        })
        .catch(err => {
            console.log(err)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addStudent')
        })
})

module.exports = router