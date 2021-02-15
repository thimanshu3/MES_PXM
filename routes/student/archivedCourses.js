const express = require('express')

const { MySql } = require('../../db')
const { CourseAssignedToStudent } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [result] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM courses c INNER JOIN (SELECT * FROM courseAssignedToStudents ca WHERE userId = ? AND expiresAt < now()) ca ON c.id = ca.courseId', { replacements: [req.user.id] })
        await Promise.all(result.map(async row => {
            const [units] = await MySql.query('SELECT u.unitNumber, su.completedAt as completedAt FROM units u LEFT JOIN studentCourseUnitTrackings su ON u.id = su.unitId AND su.courseAssignedToStudentId = ? WHERE u.courseId = ? ORDER BY u.unitNumber', { replacements: [row.id, row.courseId] })
            row.units = units
        }))

        const [result2] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM academicCourses c INNER JOIN (SELECT * FROM academicCourseAssignedToStudents ca WHERE userId = ? AND expiresAt < now()) ca ON c.id = ca.academicCourseId', { replacements: [req.user.id] })
        await Promise.all(result2.map(async row => {
            const [units] = await MySql.query('SELECT u.number, su.completedAt as completedAt FROM chapters u LEFT JOIN studentAcademicCourseChapterTrackings su ON u.id = su.chapterId AND su.academicCourseAssignedToStudentId = ? WHERE u.academicCourseId = ? ORDER BY u.number', { replacements: [row.id, row.courseId] })
            row.units = units
        }))
        res.render('student/archivedCourses', { User: req.user, courses: result, academicCourses: result2, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await CourseAssignedToStudent.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/archivedCourses')
            return
        }

        if (new Date(course.expiresAt) > new Date()) {
            req.flash('error', 'Course Not Expired!')
            res.redirect('/student/archivedCourses')
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

        res.render('student/coursePreview', { User: req.user, CourseDetails, viewCourse: false, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router