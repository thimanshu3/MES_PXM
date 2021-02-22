const express = require('express')
const bcrypt = require('bcryptjs')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')

const { addUserSchema } = require('../../validation')
const { User } = require('../../models')
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
    const users = await User.findAll()
    res.render('admin/addUser', { User: req.user , users})
})

router.post('/', (req, res) => {
    addUserSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            const {
                firstName,
                lastName,
                email,
                contactNumber,
                gender,
                role
            } = validatedObj

            const userPassword = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
            const userPasswordHashed = await bcrypt.hash(userPassword, 10)

            const userObj = {
                firstName,
                lastName,
                email,
                contactNumber,
                gender,
                role: parseInt(role),
                password: userPasswordHashed
            }


            try {
                const user = await User.create({
                    ...userObj
                })
                console.log(user)
                if (process.env.NODE_ENV === 'production')
                    sendMail(email, 'Your Credentials for DME@PXM', '', genNewUserWelcomeTemplate(email, userPassword))

                req.flash('success', 'Users Added Successfully!')
                res.redirect(`/admin/users/${user.id}`)

            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addUser')
            }
        })
        .catch(err => {
            console.log(err.toString())
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addUser')
        })
})

router.post('/import', excelUpload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/addUser')
        return
    }

    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
    excelData.shift()

    if (excelData.length === 0) {
        req.flash('error', 'No Student to Add!')
        res.redirect('/admin/addUser')
        return
    }

    if (!req.body.role) {
        req.flash('error', 'User Role is required!')
        res.redirect('/admin/addUser')
        return
    }

    const [foundUserRole] = await async.parallel([
        async () => await userRole.findOne({
            where: {
                id: req.body.role
            },
            attributes: ['id']
        }),
    ])
    if (!foundUserRole) {
        req.flash('error', 'User Role Not Found!')
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
                    role: row[6]
                }
                const validatedObj = await addStudentSchema.validateAsync(obj)
                return validatedObj
            } catch (err) {
                throw new Error(err.toString() + ` at Sr. No. ${row[0]} for ${row[3]} !`)
            }
        }))
        .then(async usersList => {
            const userEmails = []
            const usersContactNumbers = []

            userList.forEach(user => {
                user.role = r
                userEmails.push(user.email)
                user.ContactNumbers.push(user.contactNumber)
            })

            if (!checkArrayUnique(userEmails)) {
                req.flash('error', 'All Emails must be Unique!')
                res.redirect('/admin/addUser')
                return
            }
            if (!checkArrayUnique(userContactNumbers)) {
                req.flash('error', 'All Contact Numbers should be Unique!')
                res.redirect('/admin/addUser')
                return
            }

            const passwords = await Promise.all(userList.map(async user => {
                const password = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
                const hashedPassword = await bcrypt.hash(password, 10)
                user.password = hashedPassword
                return password
            }))

            let transaction

            try {
                transaction = await MySql.transaction()

                await User.bulkCreate(studentsList, { transaction })
                await transaction.commit()

                if (process.env.NODE_ENV === 'production')
                    passwords.forEach((password, index) => {
                        sendMail(userEmails[index], 'Your Credentials for DME@PXM', '', genNewUserWelcomeTemplate(userEmails[index], password))
                    })

                req.flash('success', 'Users Import Successful!')
                res.redirect('/admin/users')
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (transaction)
                    await transaction.rollback()
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addUser')
            }
        })
        .catch(err => {
            console.log(err)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addUser')
        })
})

module.exports = router