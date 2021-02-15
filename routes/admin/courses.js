const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const async = require('async')
const readXlsxFile = require('read-excel-file/node')

const { MySql } = require('../../db')
const { Course, Unit, Topic, Specialization, StudentCourseUnitTracking } = require('../../models')
const { addCourseSchema: updateCourseSchema, addTopicSchema } = require('../../validation')
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
    const courses = await Course.findAll()
    res.render('admin/allCourses', { User: req.user, courses })
})

router.get('/:id', async (req, res) => {
    const [course, specializations] = await async.parallel([
        async () => await Course.findOne({
            where: {
                id: req.params.id
            }
        }),
        async () => await Specialization.findAll()
    ])
    if (!course) {
        req.flash('error', 'Course Not Found!')
        res.redirect('/admin/courses')
        return
    }

    const foundUnits = await Unit.findAll({
        where: {
            courseId: course.id
        },
        order: [
            ['unitNumber', 'ASC']
        ]
    })
    const unitIds = []
    const units = {}
    foundUnits.map(u => {
        unitIds.push(u.id)
        units[u.id] = u.toJSON()
        units[u.id].topics = []
    })

    const foundTopics = await Topic.findAll({
        where: {
            unitId: unitIds
        },
        order: [
            ['serialNumber', 'ASC']
        ]
    })
    foundTopics.forEach(t => {
        units[t.unitId].topics.push(t.toJSON())
    })

    res.render('admin/manageCourse', { User: req.user, course, courseContent: units, specializations })
})

router.get('/:id/preview', async (req, res) => {
    const course = await Course.findOne({
        where: {
            id: req.params.id
        }
    })
    if (!course) {
        req.flash('error', 'Course Not Found!')
        res.redirect('/admin/courses')
        return
    }

    const foundUnits = await Unit.findAll({
        where: {
            courseId: course.id
        },
        order: [
            ['unitNumber', 'ASC']
        ]
    })
    const unitIds = []
    const units = {}
    foundUnits.map(u => {
        unitIds.push(u.id)
        units[u.id] = u.toJSON()
        units[u.id].topics = []
    })

    const foundTopics = await Topic.findAll({
        where: {
            unitId: unitIds
        },
        order: [
            ['serialNumber', 'ASC']
        ]
    })
    foundTopics.forEach(t => {
        units[t.unitId].topics.push(t.toJSON())
    })

    res.render('admin/CoursePreview', { User: req.user, course, courseContent: units })
})

router.get('/:courseId/:unitId', async (req, res) => {
    const course = await Course.findOne({
        where: {
            id: req.params.courseId
        }
    })
    if (!course) {
        req.flash('error', 'Course Not Found!')
        res.redirect('/admin/courses')
        return
    }

    const unit = await Unit.findOne({
        where: {
            id: req.params.unitId,
            courseId: req.params.courseId
        }
    })
    if (!unit) {
        req.flash('error', 'Unit Not Found!')
        res.redirect('/admin/courses')
        return
    }

    const topics = await Topic.findAll({
        where: {
            unitId: unit.id
        },
        order: [
            ['serialNumber', 'ASC']
        ]
    })

    res.render('admin/manageUnit', { User: req.user, course, unit, topics })
})

router.put('/:id', async (req, res) => {
    updateCourseSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            try {
                const course = await Course.findOne({
                    where: {
                        id: req.params.id
                    }
                })

                if (!course) {
                    req.flash('error', 'Course Not Found!')
                    res.redirect('/admin/courses')
                    return
                }

                course.specializationId = validatedObj.specializationId
                course.iceCourseCode = validatedObj.iceCourseCode
                course.ilorCode = validatedObj.ilorCode
                course.name = validatedObj.name
                course.description = validatedObj.description
                course.semester = validatedObj.semester

                await course.save()
                req.flash('success', 'Course Updated Successfully!')
                res.redirect(`/admin/courses/${req.params.id}`)
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                req.flash('error', err.toString())
                res.redirect(`/admin/courses`)
            }
        })
        .catch(err => {
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect(`/admin/courses/${req.params.id}`)
        })
})

router.patch('/:id', courseImageUpload.single('image'), async (req, res) => {
    if (!req.file) {
        req.flash('error', 'No file to upload')
        res.redirect(`/admin/courses/${req.params.id}`)
        return
    }
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect(`/admin/courses/${req.params.id}`)
        return
    }

    try {
        const course = await Course.findOne({
            where: {
                id: req.params.id
            }
        })

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/admin/courses')
            return
        }

        course.imageSource = req.file.filename

        await course.save()
        req.flash('success', 'Course Updated Successfully!')
        res.redirect(`/admin/courses/${req.params.id}`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect(`/admin/courses`)
    }
})

router.post('/:id/addUnit', async (req, res) => {
    try {
        const [course, numberOfUnits] = await async.parallel([
            async () => await Course.findOne({
                where: {
                    id: req.params.id
                }
            }),
            async () => await Unit.count({
                where: {
                    courseId: req.params.id
                }
            })
        ])

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/admin/courses')
            return
        }

        await Unit.create({
            unitNumber: numberOfUnits + 1,
            courseId: course.id
        })

        req.flash('success', 'Unit Created Successfully!')
        res.redirect(`/admin/courses/${req.params.id}`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect(`/admin/courses`)
    }
})

router.post('/:courseId/:unitId/importTopics', excelUpload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect(`/admin/courses/${req.params.courseId}/${req.params.unitId}`)
        return
    }
    try {
        const [course, unit, numberOfTopics] = await async.parallel([
            async () => await Course.findOne({
                where: {
                    id: req.params.courseId
                }
            }),
            async () => await Unit.findOne({
                where: {
                    id: req.params.unitId,
                    courseId: req.params.courseId
                }
            }),
            async () => await Topic.count({
                where: {
                    unitId: req.params.unitId
                }
            })
        ])

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/admin/courses')
            fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            return
        }
        if (!unit) {
            req.flash('error', 'Unit Not Found!')
            res.redirect('/admin/courses')
            fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            return
        }

        const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
        fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        excelData.shift()

        if (excelData.length === 0) {
            req.flash('error', 'No Topic to Add!')
            res.redirect(`/admin/courses/${req.params.courseId}/${req.params.unitId}`)
            return
        }

        Promise
            .all(excelData.map(async (row, index) => {
                try {
                    return {
                        serialNumber: numberOfTopics + index + 1,
                        unitId: req.params.unitId,
                        ...(await addTopicSchema.validateAsync({
                            name: row[1],
                            outcome: row[2],
                            objectResourceId: row[3],
                            duration: row[4]
                        }))
                    }
                } catch (err) {
                    throw new Error(err.toString() + ` at Sr. No. ${row[0]}`)
                }
            }))
            .then(async data => {
                let transaction
                try {
                    transaction = await MySql.transaction()
                    await Topic.bulkCreate(data, { transaction })
                    await StudentCourseUnitTracking.destroy({
                        where: {
                            unitId: req.params.unitId
                        },
                        transaction
                    })
                    await transaction.commit()
                    req.flash('success', 'Topics Import Completed!')
                    res.redirect(`/admin/courses/${req.params.courseId}/${req.params.unitId}`)
                } catch (err) {
                    console.log(err)
                    if (transaction)
                        await transaction.rollback()
                    if (err.name === 'SequelizeUniqueConstraintError')
                        req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                    else
                        req.flash('error', err.toString())
                    res.redirect(`/admin/courses/${req.params.courseId}/${req.params.unitId}`)
                }
            })
            .catch(err => {
                console.log(err)
                req.flash('error', err.toString() || 'Validation Error!')
                res.redirect('/admin/addStudent')
            })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect(`/admin/courses/${req.params.courseId}/${req.params.unitId}`)
    }
})

module.exports = router