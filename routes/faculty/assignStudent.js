const { Router } = require('express')
const async = require('async')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const {
    User,
    Specialization,
    AcademicCourseAssignedToStudent,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    AcademicCourse,
    ActivityLog
} = require('../../models')

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

        const [students, Specializations] = await async.parallel([
            async () => await User.findAll({
                where: {
                    role: 3,
                    college: req.user.college,
                    semester: allSemesters,
                    specialization: allSpecializations,
                    active: true
                }
            }),
            async () => await Specialization.findAll()
        ])
        const specializations = {}
        Specializations.forEach(s => specializations[s.id] = s.name)
        res.render('faculty/assignStudent', {
            User: req.user, students: students.map(st => {
                const obj = st.toJSON()
                obj.specializationName = specializations[obj.specialization]
                return obj
            })
        })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/api/courses', async (req, res) => {
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
            res.send({ courses: c })
        } else {
            res.send({ courses: [] })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/api/:id/students', async (req, res) => {
    try {
        const academicCourse = await AcademicCourse.findOne({
            where: {
                id: req.params.id
            },
            attributes: ['semester', 'specializationId']
        })

        if (!academicCourse)
            return res.status(404).json({ status: 400, message: 'Course Not Found!' })

        const [students, specialization, assignedStudents] = await async.parallel([
            async () => await User.findAll({
                where: {
                    college: req.user.college,
                    semester: academicCourse.semester,
                    specialization: academicCourse.specializationId
                }
            }),
            async () => await Specialization.findOne({
                where: {
                    id: academicCourse.specializationId
                }
            }),
            async () => await AcademicCourseAssignedToStudent.findAll({
                where: {
                    expiresAt: {
                        [Op.gt]: new Date()
                    },
                    academicCourseId: req.params.id
                },
                attributes: [
                    'userId',
                    'expiresAt',
                    'createdAt'
                ]
            })
        ])

        res.send({
            students: students.map(stu => {
                const student = stu.toJSON()
                student.isAssigned = false
                const found = assignedStudents.find(s => s.userId === student.id)
                if (found) {
                    student.isAssigned = true
                    student.assignedAt = found.createdAt
                    student.expiresAt = found.expiresAt
                }
                return student
            }), specialization
        })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.post('/api/assignCourse', async (req, res) => {
    try {
        const { students, courseId, expiresAt } = req.body
        if (!students || !courseId || !expiresAt) return res.status(400).json({ status: 400, message: 'students, courseId & expiresAt is required!' })
        const exp = new Date(expiresAt)
        if (exp < new Date()) return res.status(400).json({ status: 400, message: 'Expiration date must be higher!' })
        const academicCourse = await AcademicCourse.findOne({
            where: {
                id: courseId
            },
            attributes: ['semester', 'specializationId']
        })

        if (!academicCourse)
            return res.status(404).json({ status: 400, message: 'Course Not Found!' })
        if (Array.isArray(students)) {
            const data = students.map(st => ({
                userId: st,
                academicCourseId: courseId,
                expiresAt: exp,
                collegeId: req.user.college,
                assignedBy: req.user.id
            }))
            await async.parallel([
                async () => await AcademicCourseAssignedToStudent.bulkCreate(data),
                async () => await ActivityLog.create({
                    id: courseId,
                    name: 'Academic Course',
                    type: 'Muti Assign',
                    user: req.user.id,
                    timestamp: new Date()
                })
            ])
            res.send({ status: 200, message: 'Course assigned successfully' })
        } else {
            res.status(400).json({ status: 400, message: 'students must be list!' })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const userDetail = await User.findOne({
            where: {
                id: req.params.id
            },
            attributes: ['semester', 'specialization']
        })

        if (!userDetail) return res.status(400).json({ status: 400, message: 'User Not Found!' })

        const [allCourses, assignedCourses] = await async.parallel([
            async () => await AcademicCourse.findAll({
                where: {
                    collegeId: req.user.college,
                    // specializationId: userDetail.specialization,
                    semester: userDetail.semester,
                    creator: req.user.id
                }
            }),
            async () => await AcademicCourseAssignedToStudent.findAll({
                where: {
                    userId: req.params.id,
                    assignedBy: req.user.id,
                    expiresAt: {
                        [Op.gt]: new Date()
                    }
                },
                attributes: ['expiresAt', 'academicCourseId']
            })
        ])

        const courses1 = []
        const courses2 = []
        allCourses.forEach(course => {
            const obj = course.toJSON()
            const found = assignedCourses.find(ac => ac.academicCourseId === obj.id)
            if (found) {
                obj.expiresAt = found.expiresAt
                courses1.push(obj)
            } else {
                courses2.push(obj)
            }
        })

        res.status(200).json({ status: 200, assignedCourses: courses1, availableCourses: courses2 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.post('/', async (req, res) => {
    try {
        const { userId, academicCourseId, expiresAt } = req.body
        if (!userId) return res.status(400).json({ status: 400, message: 'userId is required!' })
        if (!academicCourseId) return res.status(400).json({ status: 400, message: 'academicCourseId is required!' })
        let date
        if (expiresAt) {
            date = new Date(expiresAt)
        } else {
            date = new Date()
            date.setDate(date.getMonth + 6)
        }

        const found = await AcademicCourseAssignedToStudent.findOne({
            where: {
                userId,
                academicCourseId,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        })

        if (found) return res.status(400).json({ status: 400, message: 'Course Already assigned!' })

        await async.parallel([
            async () => await AcademicCourseAssignedToStudent.create({
                userId,
                academicCourseId,
                expiresAt,
                collegeId: req.user.college,
                assignedBy: req.user.id
            }),
            async () => await ActivityLog.create({
                id: academicCourseId,
                name: 'Academic Course',
                type: 'Assign',
                user: req.user.id,
                timestamp: new Date()
            })
        ])
        res.status(201).json({ status: 201, message: 'Assigned Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router