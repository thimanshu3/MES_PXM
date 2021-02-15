const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { User } = require('../../models')
const { formatDate, random } = require('../../util')
const { updateUserProfileSchema } = require('../../validation')

const userProfileStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads/userProfile'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const imageFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const userProfileUpload = multer({
    storage: userProfileStorage,
    fileFilter: imageFilter
})

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const profile = await User.findOne({
            where: {
                id: req.user.id
            },
            attributes: ['email', 'contactNumber', 'firstName', 'lastName', 'gender', 'profileImageSource', 'alternateEmail', 'githubUrl', 'linkedinUrl']
        })
        res.render('user/profile', { profile, formatDate, User: req.user })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/')
    }
})

router.patch('/', async (req, res) => {
    updateUserProfileSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            try {
                const user = await User.findOne({
                    where: {
                        id: req.user.id
                    }
                })

                if (!user) {
                    req.flash('error', 'User Not Found!')
                    res.redirect('/user/profile')
                    return
                }

                const { firstName, lastName, contactNumber, gender, alternateEmail, githubUrl, linkedinUrl } = validatedObj

                if (req.user.role !== 3) {
                    user.firstName = firstName
                    user.lastName = lastName
                    user.contactNumber = contactNumber
                    user.gender = gender
                }

                if (alternateEmail)
                    user.alternateEmail = alternateEmail
                if (githubUrl)
                    user.githubUrl = githubUrl
                if (linkedinUrl)
                    user.linkedinUrl = linkedinUrl

                await user.save()
                req.flash('success', 'Profile Updated Successfully!')
                res.redirect('/user/profile')
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                req.flash('error', err.toString())
                res.redirect('/user/profile')
            }
        })
        .catch(err => {
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/user/profile')
        })
})

router.post('/profileImage', userProfileUpload.single('profileImage'), async (req, res) => {
    if (!req.file) {
        req.flash('error', 'No File Uploaded')
        res.redirect('/user/profile')
        return
    }

    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/user/profile')
        return
    }

    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        })

        if (!user) {
            fs.unlink(`uploads/userProfile/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            req.flash('error', 'User Not Found!')
            res.redirect('/user/profile')
            return
        }

        const oldProfileImage = user.profileImageSource

        user.profileImageSource = req.file.filename

        await user.save()

        if (oldProfileImage !== 'default-user.png') {
            fs.unlink(`uploads/userProfile/${oldProfileImage}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        }

        req.flash('success', 'Profile Image Updated!')
        res.redirect('/user/profile')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        fs.unlink(`uploads/userProfile/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/admin/addCollege')
    }
})

module.exports = router