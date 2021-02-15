const { Router } = require('express')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { MySql } = require('../../db')
const {
    AcademicCourse,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    StudentAcademicCourseChapterTracking,
    StudentAcademicCourseLessonTracking,
    StudentAcademicCourseLog,
    Specialization,
    Chapter,
    Lesson,
    User,
    ActivityLog
} = require('../../models')
const { formatDateMoment, random } = require('../../util')

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

const router = Router()

router.get('/', async (req, res) => {
    try {
        let allSemesters, allSpecializations

        if (!req.user.isHOD) {
            const [assignedSemesters, assignedSpecializations] = await async.parallel([
                async () => await FacultySemesterAssignment.findAll({
                    where: {
                        facultyId: req.user.id,
                        active: true
                    }
                }),
                async () => await FacultySpecializationAssignment.findAll({
                    where: {
                        facultyId: req.user.id,
                        active: true
                    }
                })
            ])

            allSemesters = assignedSemesters.map(s => s.semester)
            allSpecializations = assignedSpecializations.map(s => s.specialization)
        } else {
            allSemesters = [1, 2, 3, 4, 5, 6, 7, 8]
            allSpecializations = [req.user.hodSpecializationId]
        }

        if (allSemesters.length && allSpecializations.length) {
            const [courses] = await MySql.query(`SELECT ac.id as id, ac.name as name, ac.description as description, ac.semester as semester, ac.creator as creator, ac.imageSource as imageSource, ac.specializationName as specializationName, users.firstName as creatorFirstName, users.lastName as creatorLastName FROM (SELECT ac.id as id, ac.name as name, ac.description as description, ac.semester as semester, ac.creator as creator, ac.imageSource as imageSource, s.name as specializationName FROM (SELECT * FROM academicCourses WHERE collegeId = ? AND semester IN (${allSemesters}) AND specializationId IN (${allSpecializations})) ac INNER JOIN specializations s ON ac.specializationId = s.id) ac INNER JOIN users ON users.id = ac.creator`, { replacements: [req.user.college] })
            let c
            if (req.user.isHOD)
                c = courses
            else
                c = courses.filter(co => co.creator === req.user.id)
            res.render('faculty/academicCourses', { User: req.user, courses: c })
        } else {
            res.render('faculty/academicCourses', { User: req.user, courses: [] })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        let ac = await AcademicCourse.findOne({
            where: {
                id: req.params.id,
                collegeId: req.user.college
            }
        })

        if (!ac) {
            req.flash('error', 'Course not found!')
            res.redirect('/faculty/academicCourses')
            return
        }

        const [chapters, s, creatorDetails] = await async.parallel([
            async () => await Chapter.findAll({
                where: {
                    academicCourseId: req.params.id
                },
                order: [
                    ['number', 'ASC']
                ]
            }),
            async () => await Specialization.findOne({
                where: {
                    id: ac.specializationId
                }
            }),
            async () => await User.findOne({
                where: {
                    id: ac.creator
                },
                attributes: ['firstName', 'lastName']
            })
        ])

        ac = ac.toJSON()
        ac.specializationName = s.name
        ac.isCreator = ac.creator === req.user.id
        ac.creatorName = creatorDetails.firstName + ' ' + creatorDetails.lastName

        ac.chapters = []

        await async.eachLimit(chapters, 5, async ch => {
            const chapter = ch.toJSON()
            chapter.lessons = await Lesson.findAll({
                where: {
                    chapterId: chapter.id
                },
                order: [
                    ['number', 'ASC']
                ]
            })
            ac.chapters.push(chapter)
        })

        await ActivityLog.create({
            id: ac.id,
            name: 'Academic Course',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/academicCourse', { User: req.user, course: ac, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id/:chapterId/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson.findOne({
            where: {
                id: req.params.lessonId,
                chapterId: req.params.chapterId
            }
        })

        if (!lesson) {
            req.flash('error', 'Lesson Not Found!')
            res.redirect('/faculty/academicCourses')
            return
        }

        await ActivityLog.create({
            id: lesson.id,
            name: 'Academic Course Lesson',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/academicCourseLesson', { User: req.user, lesson })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/:id/addChapter', async (req, res) => {
    try {
        if (!req.body.name) {
            req.flash('error', 'name is required!')
            res.redirect(`/faculty/academicCourses/${req.params.id}`)
            return
        }
        const count = await Chapter.count({
            where: {
                academicCourseId: req.params.id
            }
        })

        const c = await Chapter.create({ name: req.body.name, number: count + 1, academicCourseId: req.params.id })
        await ActivityLog.create({
            id: c.id,
            name: 'Academic Course Chapter',
            type: 'Create',
            user: req.user.id,
            timestamp: new Date()
        })

        req.flash('success', 'Chapter Added!')
        res.redirect(`/faculty/academicCourses/${req.params.id}`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/:id/:chapterId/addLesson', async (req, res) => {
    try {
        if (!req.body.name) return res.status(400).json({ status: 400, message: 'name is required!' })
        if (!req.body.outcome) return res.status(400).json({ status: 400, message: 'outcome is required!' })
        if (!req.body.duration) return res.status(400).json({ status: 400, message: 'duration is required!' })
        if (!req.body.content) return res.status(400).json({ status: 400, message: 'content is required!' })

        const count = await Lesson.count({
            where: {
                chapterId: req.params.chapterId
            }
        })

        const l = await Lesson.create({
            name: req.body.name,
            number: count + 1,
            chapterId: req.params.chapterId,
            outcome: req.body.outcome,
            duration: req.body.duration,
            content: req.body.content
        })

        await StudentAcademicCourseChapterTracking.destroy({
            where: {
                chapterId: req.params.chapterId
            }
        })

        await ActivityLog.create({
            id: l.id,
            name: 'Academic Course Lesson',
            type: 'Create',
            user: req.user.id,
            timestamp: new Date()
        })

        res.status(201).json({ status: 201 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/course/:id', async (req, res) => {
    try {
        const academicCourse = await AcademicCourse.findOne({
            where: {
                id: req.params.id,
                creator: req.user.id
            }
        })
        if (!academicCourse) return res.status(404).json({ status: 404, message: 'Academic Course Not Found!' })
        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200, academicCourse })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/chapter/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!chapter) return res.status(404).json({ status: 404, message: 'Chapter Not Found!' })
        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course Chapter',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200, chapter })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/lesson/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!lesson) return res.status(404).json({ status: 404, message: 'Lesson Not Found!' })
        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course Lesson',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200, lesson })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.patch('/course/:id', courseImageUpload.single('image'), async (req, res) => {
    if (req.fileValidationError) return res.json({ status: 400, message: req.fileValidationError })
    try {
        const { name, description } = req.body
        const academicCourse = await AcademicCourse.findOne({
            where: {
                id: req.params.id,
                creator: req.user.id
            }
        })
        if (!academicCourse) return res.status(404).json({ status: 404, message: 'Academic Course Not Found!' })
        if (name) academicCourse.name = name
        if (description) academicCourse.description = description
        if (req.file) {
            if (academicCourse.imageSource !== 'default-course.png') fs.unlink(`uploads/courseImages/${academicCourse.imageSource}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            academicCourse.imageSource = req.file.filename
        }
        await async.parallel([
            async () => await academicCourse.save(),
            await ActivityLog.create({
                id: req.params.id,
                name: 'Academic Course',
                type: 'Update',
                user: req.user.id,
                timestamp: new Date()
            })
        ])

        res.json({ status: 200, academicCourse })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (req.file && req.file.filename)
            fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.patch('/chapter/:id', async (req, res) => {
    try {
        const { name, number } = req.body
        const chapter = await Chapter.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!chapter) return res.status(404).json({ status: 404, message: 'Chapter Not Found!' })
        if (name) chapter.name = name
        await chapter.save()
        if (number) {
            const chapters = await Chapter.findAll({
                where: {
                    academicCourseId: chapter.academicCourseId
                },
                order: [
                    ['number', 'ASC']
                ]
            })
            if (number <= chapters.length) {
                const foundChapterIndex = chapters.findIndex(c => c.id === req.params.id)
                if (foundChapterIndex) {
                    const foundChapter = chapters[foundChapterIndex]
                    if (foundChapter) {
                        chapters.splice(foundChapterIndex, 1)
                        chapters.splice(number - 1, 0, foundChapter)
                        chapters.forEach((chapter, index) => chapter.number = index + 1)
                    }
                }
            }
            await Promise.all(chapters.map(ch => ch.save()))
        }
        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course Chapter',
            type: 'Update',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200, chapter })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.patch('/lesson/:id', async (req, res) => {
    try {
        const { name, outcome, duration, content, number } = req.body.data
        const lesson = await Lesson.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!lesson) return res.status(404).json({ status: 404, message: 'Lesson Not Found!' })
        if (name) lesson.name = name
        if (outcome) lesson.outcome = outcome
        if (duration) lesson.duration = duration
        if (content) lesson.content = content
        await lesson.save()
        if (number) {
            const lessons = await Lesson.findAll({
                where: {
                    chapterId: lesson.chapterId
                },
                order: [
                    ['number', 'ASC']
                ]
            })
            if (number <= lessons.length) {
                const foundLessonIndex = lessons.findIndex(l => l.id === req.params.id)
                if (foundLessonIndex) {
                    const foundLesson = lessons[foundLessonIndex]
                    if (foundLesson) {
                        lessons.splice(foundLessonIndex, 1)
                        lessons.splice(number - 1, 0, foundLesson)
                        lessons.forEach((lesson, index) => lesson.number = index + 1)
                    }
                }
            }
            await Promise.all(lessons.map(l => l.save()))
        }
        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course Lesson',
            type: 'Update',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200, lesson })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.delete('/lesson/:id', async (req, res) => {
    let transaction
    try {
        transaction = await MySql.transaction()
        await async.parallel([
            async () => await Lesson.destroy({ where: { id: req.params.id }, transaction }),
            async () => await StudentAcademicCourseLessonTracking.destroy({ where: { lessonId: req.params.id }, transaction }),
            async () => await StudentAcademicCourseLog.destroy({ where: { lesson: req.params.id }, transaction })
        ])
        await transaction.commit()
        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course Lesson',
            type: 'Delete',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200 })
    } catch (err) {
        if (transaction)
            await transaction.rollback()
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router