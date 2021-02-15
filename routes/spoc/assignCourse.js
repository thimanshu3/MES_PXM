const express = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { User, Specialization, CourseAssignedToStudent, CourseAssignedToCollege } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    const [students, specialization] = await async.parallel([
        async () => await User.findAll({
            where: {
                role: 3,
                active: true,
                college: req.user.college
            },
            order: [
                ['specialization', 'ASC']
            ]
        }),
        async () => await Specialization.findAll()
    ])
    const specializations = {}
    specialization.forEach(s => specializations[s.id] = s.name)
    res.render('spoc/assignCourse', { User: req.user, students, specializations })
})

router.get('/courses/:id', async (req, res) => {
    try {
        const foundStudent = await User.findOne({
            where: {
                id: req.params.id,
                role: 3,
                active: true,
                college: req.user.college
            }
        })

        if (!foundStudent)
            return res.status(404).json({ status: 400, message: 'Student Not Found!' })

        const semester = foundStudent.semester
        const specializationId = foundStudent.specialization
        const collegeId = foundStudent.college

        const [foundCourses] = await MySql.query('SELECT c.id as id, c.name as name, c.semester as semester, ca.id as assigned, ca.expiresAt as expiresAt FROM (SELECT c.id as id, c.specializationId as specializationId, c.name as name, c.semester as semester FROM courses c INNER JOIN courseAssignedToColleges ca ON c.id = ca.courseId WHERE ca.collegeId = ? AND expiresAt > now()) c LEFT JOIN (SELECT * FROM courseAssignedToStudents ca WHERE ca.userId = ?) ca ON c.id = ca.courseId WHERE c.specializationId = ? ORDER BY c.semester ASC', { replacements: [collegeId, req.params.id, specializationId] })
        const courses = []
        const additionalCourses = []
        const assignedCourses = []
        foundCourses.forEach(course => {
            if (course.assigned) {
                assignedCourses.push({
                    ...course,
                    assignId: course.assigned,
                    assigned: true
                })
            } else {
                if (course.semester === semester) {
                    courses.push({
                        ...course,
                        assigned: false
                    })
                } else {
                    additionalCourses.push({
                        ...course,
                        assigned: false
                    })
                }
            }
        })
        res.json({ status: 200, data: { assignedCourses, courses: [...courses, ...additionalCourses] } })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

router.post('/', async (req, res) => {
    const { courseIds, studentId, expiresAt } = req.body
    if (!Array.isArray(courseIds))
        return res.status(400).json({ status: 400, message: 'courseIds must be array.' })
    if (!studentId)
        return res.status(400).json({ status: 400, message: 'studentId is required!' })
    try {
        const user = await User.findOne({
            where: {
                id: studentId
            },
            attributes: ['id', 'college']
        })
        const courseAssignedToCollege = []
        const foundAssignedCollege = await CourseAssignedToCollege.findAll({
            where: {
                collegeId: user.college,
                courseId: courseIds
            }
        })
        foundAssignedCollege.forEach(cac => {
            if (new Date(cac.toJSON().expiresAt) > new Date()) {
                courseAssignedToCollege.push(cac.toJSON())
            }
        })
        if (courseAssignedToCollege.length === 0)
            return res.status(404).json({ status: 404, message: 'Course Not Found.' })
        const data = []
        courseAssignedToCollege.forEach(c => {
            const obj = {
                userId: studentId,
                courseId: c.courseId,
                courseAssignedToCollegeId: c.id
            }
            if (expiresAt && new Date(expiresAt) < new Date(c.expiresAt) && new Date(expiresAt) > new Date())
                obj.expiresAt = expiresAt
            else
                obj.expiresAt = c.expiresAt
            data.push(obj)
        })
        await CourseAssignedToStudent.bulkCreate(data)
        res.json({ status: 200, message: 'Assigned Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

module.exports = router