const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { Specialization, Course } = require('../../models')
const { addCourseSchema } = require('../../validation')
const { random } = require('../../util')

const courseImageStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads/courseImages'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const imageFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const courseImageUpload = multer({
    storage: courseImageStorage,
    fileFilter: imageFilter
})

const router = express.Router()

router.get('/', async (req, res) => {
    const specializations = await Specialization.findAll()
    res.render('admin/addCourse', { User: req.user, specializations })
})

router.post('/', courseImageUpload.single('image'), (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/addCourse')
        return
    }
    addCourseSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            try {
                if (req.file)
                    validatedObj.imageSource = req.file.filename
                const course = await Course.create(validatedObj)
                req.flash('success', 'Course Added Successfully!')
                res.redirect(`/admin/courses/${course.id}`)
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (req.file && req.file.filename)
                    fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString() || 'Something Went Wrong!')
                res.redirect('/admin/addCourse')
            }
        })
        .catch(err => {
            if (req.file && req.file.filename)
                fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/addCourse')
        })
})

module.exports = router