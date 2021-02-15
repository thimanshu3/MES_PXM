const express = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { College, User, Specialization, CourseAssignedToStudent, AcademicCourseAssignedToStudent, AcademicCourse, LoginReport } = require('../../models')
const { formatDate, formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [students, Specializations] = await async.parallel([
            async () => await User.findAll({
                where: {
                    role: 3,
                    college: req.user.college,
                    active: true
                }
            }),
            async () => await Specialization.findAll()
        ])
        const specializations = {}
        Specializations.forEach(s => specializations[s.id] = s.name)
        res.render('spoc/students', { User: req.user, students, specializations })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const foundStudent = await User.findOne({
            where: {
                id: req.params.id,
                role: 3
            }
        })

        if (!foundStudent) {
            req.flash('error', 'Student Not Found!')
            res.redirect('/spoc/students')
            return
        }

        if (!(foundStudent.college === req.user.college)) {
            req.flash('error', 'Student does not belong to your College!')
            res.redirect('/spoc/students')
        }

        const [foundCollege, specializations, result, result2, result3, result4] = await async.parallel([
            async () => await College.findOne({
                where: {
                    id: foundStudent.college
                }
            }),
            async () => await Specialization.findAll(),
            async () => {
                const [result] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM courses c INNER JOIN (SELECT * FROM courseAssignedToStudents ca WHERE userId = ? AND expiresAt > now()) ca ON c.id = ca.courseId', { replacements: [req.params.id] })
                await Promise.all(result.map(async row => {
                    const [units] = await MySql.query('SELECT u.unitNumber, su.completedAt as completedAt FROM units u LEFT JOIN studentCourseUnitTrackings su ON u.id = su.unitId AND su.courseAssignedToStudentId = ? WHERE u.courseId = ? ORDER BY u.unitNumber', { replacements: [row.id, row.courseId] })
                    row.units = units
                }))
                return result
            },
            async () => {
                const [result] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM courses c INNER JOIN (SELECT * FROM courseAssignedToStudents ca WHERE userId = ? AND expiresAt < now()) ca ON c.id = ca.courseId', { replacements: [req.params.id] })
                await Promise.all(result.map(async row => {
                    const [units] = await MySql.query('SELECT u.unitNumber, su.completedAt as completedAt FROM units u LEFT JOIN studentCourseUnitTrackings su ON u.id = su.unitId AND su.courseAssignedToStudentId = ? WHERE u.courseId = ? ORDER BY u.unitNumber', { replacements: [row.id, row.courseId] })
                    row.units = units
                }))
                return result
            },
            async () => {
                const [result2] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM academicCourses c INNER JOIN (SELECT * FROM academicCourseAssignedToStudents ca WHERE userId = ? AND expiresAt > now()) ca ON c.id = ca.academicCourseId', { replacements: [req.params.id] })
                await Promise.all(result2.map(async row => {
                    const [units] = await MySql.query('SELECT u.number, su.completedAt as completedAt FROM chapters u LEFT JOIN studentAcademicCourseChapterTrackings su ON u.id = su.chapterId AND su.academicCourseAssignedToStudentId = ? WHERE u.academicCourseId = ? ORDER BY u.number', { replacements: [row.id, row.courseId] })
                    row.units = units
                }))
                return result2
            },
            async () => {
                const [result2] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM academicCourses c INNER JOIN (SELECT * FROM academicCourseAssignedToStudents ca WHERE userId = ? AND expiresAt < now()) ca ON c.id = ca.academicCourseId', { replacements: [req.params.id] })
                await Promise.all(result2.map(async row => {
                    const [units] = await MySql.query('SELECT u.number, su.completedAt as completedAt FROM chapters u LEFT JOIN studentAcademicCourseChapterTrackings su ON u.id = su.chapterId AND su.academicCourseAssignedToStudentId = ? WHERE u.academicCourseId = ? ORDER BY u.number', { replacements: [row.id, row.courseId] })
                    row.units = units
                }))
                return result2
            }
        ])

        if (!foundCollege) {
            console.log(`${foundStudent.id} has no college association from Colleges table.`)
            req.flash('error', 'College Not Found!')
            res.redirect('/spoc/students')
            return
        }

        let lastLogin = await LoginReport.findOne({
            where: {
                user: req.params.id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })

        if (lastLogin)
            lastLogin = lastLogin.createdAt

        res.render('spoc/student', { User: req.user, student: foundStudent, college: foundCollege, specializations, formatDate, courses: result, previousCourses: result2, academicCourses: result3, previousAcademicCourses: result4, formatDateMoment, lastLogin })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id/progress', async (req, res) => {
    try {
        if (req.query.courseType === 'ibm') {
            const course = await CourseAssignedToStudent.findOne({
                where: {
                    id: req.params.id
                }
            })

            if (!course) {
                req.flash('error', 'Course Not Found!')
                res.redirect('/spoc/students')
                return
            }

            const [units] = await MySql.query('SELECT u.id as id, u.unitNumber as unitNumber, s.completedAt as completedAt FROM (SELECT * FROM units WHERE courseId = ?) u LEFT JOIN (SELECT * FROM studentCourseUnitTrackings WHERE courseAssignedToStudentId = ?) s ON u.id = s.unitId ORDER BY u.unitNumber', { replacements: [course.courseId, course.id] })

            const [topics] = await MySql.query(`SELECT t.id as id, t.serialNumber as serialNumber, t.unitId as unitId, t.name as name, t.objectResourceId as objectResourceId, t.outcome as outcome, t.duration as duration, st.courseAssignedToStudentId as courseAssignedToStudentId, st.completedAt as completedAt FROM topics t LEFT JOIN (SELECT * FROM studentCourseTopicTrackings WHERE courseAssignedToStudentId = ?) st ON t.id = st.topicId WHERE t.unitId IN (${units.map(u => `'${u.id}'`)}) ORDER BY t.serialNumber`, { replacements: [course.id] })

            const CourseDetails = {}

            units.forEach(unit => CourseDetails[unit.id] = {
                ...unit,
                topics: []
            })

            topics.forEach(topic => CourseDetails[topic.unitId].topics.push(topic))

            res.render('spoc/StudentProgress', { User: req.user, CourseDetails, formatDateMoment })
        } else if (req.query.courseType === 'academic') {
            const academicCourse = await AcademicCourseAssignedToStudent.findOne({
                where: {
                    id: req.params.id
                }
            })

            if (!academicCourse) {
                req.flash('error', 'Course Not Found!')
                res.redirect('/spoc/students')
                return
            }

            let viewCourse = true
            if (new Date(academicCourse.expiresAt) < new Date()) {
                viewCourse = false
            }

            const course = (await AcademicCourse.findOne({
                where: {
                    id: academicCourse.academicCourseId
                }
            })).toJSON()

            if (!course) {
                req.flash('error', 'Course Not Found!')
                res.redirect('/spoc/students/' + req.params.id)
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

            academicCourse.assignedByName = assignedBy.firstName + assignedBy.lastName
            academicCourse.semester = course.semester
            academicCourse.name = course.name
            academicCourse.description = course.description
            academicCourse.imageSource = course.imageSource
            academicCourse.specializationId = course.specializationId
            academicCourse.specializationName = specialization.name

            const [chapters] = await MySql.query('SELECT c.id as id, c.number as number, c.name as name, s.completedAt as completedAt FROM (SELECT * FROM chapters WHERE academicCourseId = ?) c LEFT JOIN (SELECT * FROM studentAcademicCourseChapterTrackings WHERE academicCourseAssignedToStudentId = ?) s ON c.id = s.chapterId ORDER BY c.number', { replacements: [academicCourse.academicCourseId, academicCourse.id] })

            const [lessons] = await MySql.query(`SELECT t.id as id, t.number as number, t.chapterId as chapterId, t.name as name, t.outcome as outcome, t.duration as duration, st.academicCourseAssignedToStudentId as academicCourseAssignedToStudentId, st.completedAt as completedAt FROM lessons t LEFT JOIN (SELECT * FROM studentAcademicCourseLessonTrackings WHERE academicCourseAssignedToStudentId = ?) st ON t.id = st.lessonId WHERE t.chapterId IN (${chapters.map(c => `'${c.id}'`)}) ORDER BY t.number`, { replacements: [academicCourse.id] })

            const CourseDetails = {}

            chapters.forEach(chapter => CourseDetails[chapter.id] = {
                ...chapter,
                lessons: []
            })

            lessons.forEach(lesson => CourseDetails[lesson.chapterId].lessons.push(lesson))

            academicCourse.chapters = Object.values(CourseDetails)

            res.render('spoc/studentAcademicCourseProgress', { User: req.user, course: academicCourse, viewCourse, formatDateMoment })
        } else {
            req.flash('Invalid Course')
            res.redirect('/spoc/students')
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/')
    }
})

module.exports = router