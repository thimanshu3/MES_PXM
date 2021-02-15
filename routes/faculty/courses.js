const express = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { Course, Unit, Topic, CourseAssignedToCollege, FacultySemesterAssignment, FacultySpecializationAssignment, ActivityLog } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
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

        if (assignedSemesters.length === 0 || assignedSpecializations.length === 0)
            return res.render('faculty/allCourses', { User: req.user, courses: [] })

        const semesters = assignedSemesters.map(s => s.semester)
        const specializations = assignedSpecializations.map(s => s.specialization)

        let semestersIn = ''
        semesters.forEach(s => {
            semestersIn += `${s},`
        })
        semestersIn = semestersIn.slice(0, -1)

        let specializationsIn = ''
        specializations.forEach(s => {
            specializationsIn += `${s},`
        })
        specializationsIn = specializationsIn.slice(0, -1)

        const [result] = await MySql.query(`SELECT c.id as id, c.specializationId as specializationId, c.iceCourseCode as iceCourseCode, c.ilorCode as ilorCode, c.name as name, c.description as description, c.semester as semester, c.imageSource as imageSource, s.name as specializationName FROM courses c INNER JOIN (SELECT * FROM courseAssignedToColleges WHERE courseAssignedToColleges.collegeId = ? AND expiresAt > now()) ca ON c.id = ca.courseId INNER JOIN specializations s ON c.specializationId = s.id WHERE c.specializationId IN (${specializationsIn}) AND c.semester IN (${semestersIn})`, { replacements: [req.user.college] })
        res.render('faculty/allCourses', { User: req.user, courses: result })
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
            res.redirect('/faculty/courses')
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
            res.redirect('/faculty/courses')
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

        await ActivityLog.create({
            id: req.params.id,
            name: 'Course',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/CourseDashboard', { User: req.user, course, courseContent: units })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router