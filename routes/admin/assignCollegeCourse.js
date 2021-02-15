const express = require('express')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const { College,
    CourseAssignedToCollege,
    CourseRevokedFromStudent,
    User,
    CourseAssignedToStudent } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    const foundColleges = await College.findAll()

    res.render('admin/assignCollegeCourse', { User: req.user, colleges: foundColleges })
})

router.get('/courses/:id', async (req, res) => {
    try {
        const foundCollege = await College.findOne({
            where: {
                id: req.params.id
            }
        })

        if (!foundCollege)
            return res.status(404).json({ status: 404, message: 'College Does Not Exists!' })

        const [result] = await MySql.query('SELECT c.id as id, c.specializationId as specializationId, c.iceCourseCode as iceCourseCode, c.ilorCode as ilorCode, c.name as name, c.description as description, c.semester as semester, c.imageSource as imageSource, ca.id as assigned, ca.id as assignId, ca.expiresAt as expiresAt, ca.createdAt as assignedAt, s.name as specializationName FROM courses c LEFT JOIN (SELECT * FROM courseAssignedToColleges WHERE courseAssignedToColleges.collegeId = ?) ca ON c.id = ca.courseId INNER JOIN specializations s ON c.specializationId = s.id ORDER BY c.specializationId', { replacements: [req.params.id] })

        res.json({
            status: 200,
            data: {
                courses: result.map(item => {
                    if (item.assigned)
                        return {
                            ...item,
                            assigned: true
                        }
                    return {
                        ...item,
                        assigned: false
                    }
                })
            },

        })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() || 'Somtehing Went Wrong!' })
    }
})

router.post('/', async (req, res) => {

    const { collegeId, courseIds, expiresAt } = req.body

    if (!collegeId)
        return res.status(400).json({ status: 400, message: 'collegeId is required!' })

    if (!courseIds)
        return res.status(400).json({ status: 400, message: 'courseIds is required!' })

    if (!Array.isArray(courseIds))
        return res.status(400).json({ status: 400, message: 'courseIds must be an array!' })

    const data = courseIds.map(id => {
        const obj = {
            collegeId: collegeId,
            courseId: id
        }
        if (expiresAt && new Date(expiresAt) > new Date())
            obj.expiresAt = expiresAt
        return obj
    })

    try {
        await CourseAssignedToCollege.destroy({
            where: {
                collegeId: collegeId
            }
        })

        if (data.length > 0)
            await CourseAssignedToCollege.bulkCreate(data)

        res.status(201).json({ status: 201, message: 'Assigned Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() || 'Somtehing Went Wrong!' })
    }
})

router.get('/courses/revoke/:id', async (req, res) => {
    try {
        const cac = await CourseAssignedToCollege.findOne({
            where: {
                id: req.params.id,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        })
        if (!cac)
            return res.status(404).json({ status: 404, message: 'Course Assignment Not Found!' })
        const collegeId = cac.collegeId
        const courseId = cac.courseId
        const students = await User.findAll({
            where: {
                college: collegeId,
                role: 3
            },
            attributes: ['id', 'firstName', 'lastName', 'semester']
        })
        const cas = await CourseAssignedToStudent.findAll({
            where: {
                courseId,
                userId: students.map(s => s.id)
            },
            attributes: ['id', 'userId', 'createdAt', 'expiresAt']
        })
        res.json({
            status: 200,
            data: {
                courseAssignedToStudents: cas.map(ca => ({
                    ...ca.toJSON(),
                    studentDetails: students.find(s => s.id === ca.userId)
                }))
            }
        })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() || 'Somtehing Went Wrong!' })
    }
})

router.delete('/courses/revoke/:id', async (req, res) => {
    try {
        const cac = await CourseAssignedToCollege.findOne({
            where: {
                id: req.params.id,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        })
        if (!cac)
            return res.status(404).json({ status: 404, message: 'Course Assignment Not Found!' })
        const collegeId = cac.collegeId
        const courseId = cac.courseId
        const students = await User.findAll({
            where: {
                college: collegeId,
                role: 3
            },
            attributes: ['id']
        })
        const cas = await CourseAssignedToStudent.findAll({
            where: {
                courseId,
                userId: students.map(s => s.id)
            }
        })
        const date = new Date()
        await CourseRevokedFromStudent.bulkCreate(cas.map(ca => ({
            ...ca.toJSON(),
            assigned: false,
            unAssignedAt: date
        })))
        await CourseAssignedToStudent.destroy({
            where: {
                id: cas.map(ca => ca.id)
            }
        })
        await cac.destroy()
        res.json({ status: 200, message: 'Revoked Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() || 'Somtehing Went Wrong!' })
    }
})

module.exports = router