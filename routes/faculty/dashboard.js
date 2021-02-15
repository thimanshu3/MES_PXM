const express = require('express')
const async = require('async')
const { promisify } = require('util')

const { Redis } = require('../../db')
const { FacultySemesterAssignment, FacultySpecializationAssignment, Specialization, College } = require('../../models')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [assignedSemesters, assignedSpecializations, allSpecializations, college] = await async.parallel([
            async () => await redisGet(`faculty${req.user.id}DashboardAssignedSemesters`),
            async () => await redisGet(`faculty${req.user.id}DashboardAssignedSpecializations`),
            async () => await redisGet(`faculty${req.user.id}DashboardAllSpecializations`),
            async () => await redisGet(`faculty${req.user.id}DashboardCollegeName`)
        ])

        if (assignedSemesters && assignedSpecializations && allSpecializations && college)
            res.render('faculty/dashboard', { User: req.user, assignedSemesters: JSON.parse(assignedSemesters), assignedSpecializations: JSON.parse(assignedSpecializations), allSpecializations: JSON.parse(allSpecializations), collegeName: college })
        else {
            const [assignedSemesters, assignedSpecializations, allSpecializations, college] = await async.parallel([
                async () => {
                    if (!req.user.isHOD) return await FacultySemesterAssignment.findAll({
                        where: {
                            facultyId: req.user.id,
                            active: true
                        },
                        order: [
                            ['semester', 'ASC']
                        ]
                    })
                    return [
                        { semester: 1 },
                        { semester: 2 },
                        { semester: 3 },
                        { semester: 4 },
                        { semester: 5 },
                        { semester: 6 },
                        { semester: 7 },
                        { semester: 8 }
                    ]
                },
                async () => {
                    if (!req.user.isHOD) return await FacultySpecializationAssignment.findAll({
                        where: {
                            facultyId: req.user.id,
                            active: true
                        },
                        order: [
                            ['specialization', 'ASC']
                        ]
                    })
                    return [{
                        specialization: req.user.hodSpecializationId
                    }]
                },
                async () => await Specialization.findAll(),
                async () => await College.findOne({
                    where: {
                        id: req.user.college
                    },
                    attributes: [
                        'name'
                    ]
                })
            ])
            const semesters = assignedSemesters.map(s => s.semester)
            const specializations = assignedSpecializations.map(s => s.specialization)
            const allspecializations = {}
            allSpecializations.forEach(s => {
                allspecializations[s.id] = s.name
            })
            Redis.setex(`faculty${req.user.id}DashboardAssignedSemesters`, 600, JSON.stringify(semesters))
            Redis.setex(`faculty${req.user.id}DashboardAssignedSpecializations`, 600, JSON.stringify(specializations))
            Redis.setex(`faculty${req.user.id}DashboardAllSpecializations`, 600, JSON.stringify(allspecializations))
            Redis.setex(`faculty${req.user.id}DashboardCollegeName`, 600, college.name)
            res.render('faculty/dashboard', { User: req.user, assignedSemesters: semesters, assignedSpecializations: specializations, allSpecializations: allspecializations, collegeName: college.name })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router