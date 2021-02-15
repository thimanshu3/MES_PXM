const { Router } = require('express')
const async = require('async')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const {
    AcademicCourseAssignedToStudent,
    Lesson,
    Chapter,
    StudentAcademicCourseChapterTracking,
    StudentAcademicCourseLessonTracking,
    StudentAcademicCourseLog,
    AcademicCourse,
    User,
    Specialization,
    ActivityLog
} = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/:id', (req, res) => res.redirect(`/student/academicCourses/${req.params.id}/preview`))

router.get('/:id/preview', async (req, res) => {
    try {
        const academicCourse = await AcademicCourseAssignedToStudent.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })

        if (!academicCourse) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        if (new Date(academicCourse.expiresAt) < new Date()) {
            req.flash('error', 'Course Already Expired!')
            res.redirect('/student/courses')
            return
        }

        const course = (await AcademicCourse.findOne({
            where: {
                id: academicCourse.academicCourseId
            }
        })).toJSON()

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        const assignedBy = await User.findOne({
            where: {
                id: academicCourse.assignedBy
            },
            attributes: ['firstName', 'lastName']
        })

        const specialization = (await Specialization.findOne({
            where: {
                id: course.specializationId
            },
            attributes: ['name']
        })).toJSON()

        academicCourse.assignedByName = assignedBy.firstName + ' ' + assignedBy.lastName
        academicCourse.semester = course.semester
        academicCourse.name = course.name
        academicCourse.description = course.description
        academicCourse.imageSource = course.imageSource
        academicCourse.specializationId = course.specializationId
        academicCourse.specializationName = specialization.name

        const [chapters] = await MySql.query('SELECT c.id as id, c.number as number, c.name as name, s.completedAt as completedAt FROM (SELECT * FROM chapters WHERE academicCourseId = ?) c LEFT JOIN (SELECT * FROM studentAcademicCourseChapterTrackings WHERE academicCourseAssignedToStudentId = ?) s ON c.id = s.chapterId ORDER BY c.number', { replacements: [academicCourse.academicCourseId, academicCourse.id] })

        await ActivityLog.create({
            id: req.params.id,
            name: 'Academic Course',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })

        if (chapters.length) {
            const [lessons] = await MySql.query(`SELECT t.id as id, t.number as number, t.chapterId as chapterId, t.name as name, t.outcome as outcome, t.duration as duration, st.academicCourseAssignedToStudentId as academicCourseAssignedToStudentId, st.completedAt as completedAt FROM lessons t LEFT JOIN (SELECT * FROM studentAcademicCourseLessonTrackings WHERE academicCourseAssignedToStudentId = ?) st ON t.id = st.lessonId WHERE t.chapterId IN (${chapters.map(c => `'${c.id}'`)}) ORDER BY t.number`, { replacements: [academicCourse.id] })

            const CourseDetails = {}

            chapters.forEach(chapter => CourseDetails[chapter.id] = {
                ...chapter,
                lessons: []
            })

            lessons.forEach(lesson => CourseDetails[lesson.chapterId].lessons.push(lesson))

            academicCourse.chapters = Object.values(CourseDetails)

            res.render('student/academicCourse', { User: req.user, course: academicCourse, viewCourse: true, formatDateMoment })
        } else {
            const lessons = []

            const CourseDetails = {}

            chapters.forEach(chapter => CourseDetails[chapter.id] = {
                ...chapter,
                lessons: []
            })

            lessons.forEach(lesson => CourseDetails[lesson.chapterId].lessons.push(lesson))

            academicCourse.chapters = Object.values(CourseDetails)
            res.render('student/academicCourse', { User: req.user, course: academicCourse, viewCourse: true, formatDateMoment })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id/:chapterId/:lessonId', async (req, res) => {
    try {
        const course = await AcademicCourseAssignedToStudent.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        if (new Date(course.expiresAt) < new Date()) {
            req.flash('error', 'Course Already Expired!')
            res.redirect('/student/courses')
            return
        }

        const foundCourse = await AcademicCourse.findOne({
            where: {
                id: course.academicCourseId
            }
        })

        if (!foundCourse) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        const lesson = await Lesson.findOne({
            where: {
                id: req.params.lessonId,
                chapterId: req.params.chapterId
            }
        })

        if (!lesson) {
            req.flash('error', 'Lesson Not Found!')
            res.redirect('/student/courses')
            return
        }

        const lessonTracking = await StudentAcademicCourseLessonTracking.findOne({
            where: {
                lessonId: lesson.id,
                academicCourseAssignedToStudentId: req.params.id
            }
        })

        if (lessonTracking)
            lesson.completedAt = lessonTracking.completedAt

        await async.parallel([
            async () => await StudentAcademicCourseLog.create({
                user: req.user.id,
                college: req.user.college,
                academicCourse: foundCourse.id,
                chapter: req.params.chapterId,
                lesson: lesson.id
            }),
            async () => await ActivityLog.create({
                id: lesson.id,
                name: 'Academic Course Lesson',
                type: 'View',
                user: req.user.id,
                timestamp: new Date()
            })
        ])

        res.render('student/academicCourseLesson', { User: req.user, lesson })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/markAsComplete', async (req, res) => {
    try {
        if (!req.body.lessonId)
            return res.status(400).json({ status: 400, message: 'Lesson Id is required!' })

        const foundLesson = await Lesson.findOne({
            where: {
                id: req.body.lessonId
            }
        })

        if (!foundLesson)
            return res.status(404).json({ status: 404, message: 'Lesson Not Found!' })

        const lessonId = foundLesson.id

        const [foundChapter, lessons] = await async.parallel([
            async () => await Chapter.findOne({
                where: {
                    id: foundLesson.chapterId
                }
            }),
            async () => await Lesson.findAll({
                where: {
                    chapterId: foundLesson.chapterId
                }
            })
        ])

        const academicCourseId = foundChapter.academicCourseId
        const chapterId = foundChapter.id

        const foundCourseAssignedToStudent = await AcademicCourseAssignedToStudent.findOne({
            where: {
                userId: req.user.id,
                academicCourseId,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        })

        if (!foundCourseAssignedToStudent)
            return res.status(400).json({ status: 400, message: 'Course Not Assigned to Student!' })

        const academicCourseAssignedToStudentId = foundCourseAssignedToStudent.id

        await StudentAcademicCourseLessonTracking.findOrCreate({
            where: {
                academicCourseAssignedToStudentId,
                lessonId
            }
        })

        const completedLessons = await StudentAcademicCourseLessonTracking.findAll({
            where: {
                academicCourseAssignedToStudentId,
                lessonId: lessons.map(lesson => lesson.id)
            }
        })

        if (completedLessons.length === lessons.length) {
            await StudentAcademicCourseChapterTracking.create({
                academicCourseAssignedToStudentId,
                chapterId
            })
        }

        await ActivityLog.create({
            id: req.body.lessonId,
            name: 'Academic Course Lesson',
            type: 'Complete',
            user: req.user.id,
            timestamp: new Date()
        })

        res.status(201).json({ status: 201 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!', error: err.toString() })
    }
})

module.exports = router