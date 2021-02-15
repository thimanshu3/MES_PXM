const express = require('express')

const { MySql } = require('../../db')
const { Course, Unit, Topic, CourseAssignedToCollege } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [result] = await MySql.query('SELECT c.id as id, c.specializationId as specializationId, c.iceCourseCode as iceCourseCode, c.ilorCode as ilorCode, c.name as name, c.description as description, c.semester as semester, c.imageSource as imageSource, s.name as specializationName FROM courses c INNER JOIN (SELECT * FROM courseAssignedToColleges WHERE courseAssignedToColleges.collegeId = ? AND expiresAt > now()) ca ON c.id = ca.courseId INNER JOIN specializations s ON c.specializationId = s.id', { replacements: [req.user.college] })
        res.render('spoc/AllCourses', { User: req.user, courses: result })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const foundCourse = await Course.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!foundCourse) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/spoc/courses')
            return
        }

        const assignedCourse = await CourseAssignedToCollege.findOne({
            where: {
                collegeId: req.user.college,
                courseId: foundCourse.id
            }
        })
        if (!assignedCourse) {
            req.flash('error', 'Course Not Available to Your College!')
            res.redirect('/spoc/courses')
            return
        }

        const course = foundCourse.toJSON()

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

        res.render('spoc/CourseDashboard', { User: req.user, course, courseContent: units })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router