const { Router } = require('express')
const async = require('async')

const { MySql } = require('../../db')
const {
    AcademicCourse,
    Specialization,
    Chapter,
    Lesson,
    User
} = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const [courses] = await MySql.query(`SELECT ac.id as id, ac.name as name, ac.description as description, ac.semester as semester, ac.creator as creator, ac.imageSource as imageSource, ac.specializationName as specializationName, users.firstName as creatorFirstName, users.lastName as creatorLastName FROM (SELECT ac.id as id, ac.name as name, ac.description as description, ac.semester as semester, ac.creator as creator, ac.imageSource as imageSource, s.name as specializationName FROM (SELECT * FROM academicCourses) ac INNER JOIN specializations s ON ac.specializationId = s.id) ac INNER JOIN users ON users.id = ac.creator`)
        res.render('admin/academicCourses', { User: req.user, courses: courses })
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
                id: req.params.id
            }
        })

        if (!ac) {
            req.flash('error', 'Course not found!')
            res.redirect('/admin/academicCourses')
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

        res.render('admin/academicCourse', { User: req.user, course: ac, formatDateMoment })
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
            res.redirect('/admin/academicCourses')
            return
        }

        res.render('admin/academicCourseLesson', { User: req.user, lesson })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router