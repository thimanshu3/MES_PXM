const express = require('express')
const async = require('async')

const { MySql } = require('../../db')
const {
    College,
    CourseAssignedToStudent,
    CourseAssignedToCollege,
    User,
    Specialization,
    CourseRevokedFromStudent } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => res.render('admin/assignStudentCourse', {
    User: req.user,
    colleges: await College.findAll(),
    specializations: await Specialization.findAll()
}))

router.get('/students/:id', async (req, res) => {
    try {
        const [foundStudents] = await MySql.query('SELECT users.id as id, users.firstName as firstName, users.lastName as lastName, users.semester as semester, specializations.name as specialization FROM users INNER JOIN specializations ON users.specialization = specializations.id WHERE college = ? AND role = 3', { replacements: [req.params.id] })
        res.json({ status: 200, data: { students: foundStudents } })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/courses/:id', async (req, res) => {
    try {
        const foundStudent = await User.findOne({
            where: {
                id: req.params.id,
                role: 3,
                active: true
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

router.delete('/courses/revoke/:id', async (req, res) => {
    try {
        const courseAssigned = await CourseAssignedToStudent.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!courseAssigned)
            return res.status(404).json({ status: 404, message: 'Assigned Course Not Found!' })
        const course = (courseAssigned).toJSON()
        course.unAssignedAt = new Date()
        course.assigned = false
        async.parallel([
            async () => await CourseRevokedFromStudent.create(course),
            async () => await CourseAssignedToStudent.destroy({
                where: {
                    id: req.params.id
                }
            })
        ])
        res.json({ status: 200, message: 'Revoked Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

module.exports = router