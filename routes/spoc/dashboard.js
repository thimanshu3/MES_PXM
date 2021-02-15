const express = require('express')
const async = require('async')
const { promisify } = require('util')

const { Redis } = require('../../db')
const { Specialization, User, CourseAssignedToCollege, College } = require('../../models')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/', async (req, res) => {
    const [students, faculties, courses, specializations, college] = await async.parallel([
        async () => await redisGet(`spoc${req.user.id}DashboardNumberOfStudents`),
        async () => await redisGet(`spoc${req.user.id}DashboardNumberOfFaculties`),
        async () => await redisGet(`spoc${req.user.id}DashboardNumberOfCourses`),
        async () => await redisGet(`spoc${req.user.id}DashboardNumberOfSpecializations`),
        async () => await redisGet(`spoc${req.user.id}DashboardCollegeName`)
    ])
    if (students && faculties && courses && specializations) {
        res.render('spoc/dashboard', { User: req.user, students, faculties, courses, specializations, collegeName: college })
    }
    else {
        const [students, faculties, courses, specializations, college] = await async.parallel([
            async () => await User.count({
                where: {
                    role: 3,
                    college: req.user.college
                }
            }),
            async () => await User.count({
                where: {
                    role: 2,
                    college: req.user.college
                }
            }),
            async () => await CourseAssignedToCollege.count({
                where: {
                    collegeId: req.user.college
                }
            }),
            async () => await Specialization.count(),
            async () => await College.findOne({
                where: {
                    id: req.user.college
                },
                attributes: [
                    'name'
                ]
            })
        ])
        Redis.setex(`spoc${req.user.id}DashboardNumberOfStudents`, 600, students)
        Redis.setex(`spoc${req.user.id}DashboardNumberOfFaculties`, 600, faculties)
        Redis.setex(`spoc${req.user.id}DashboardNumberOfCourses`, 600, courses)
        Redis.setex(`spoc${req.user.id}DashboardNumberOfSpecializations`, 600, specializations)
        Redis.setex(`spoc${req.user.id}DashboardCollegeName`, 600, college.name)
        res.render('spoc/dashboard', { User: req.user, students, faculties, courses, specializations, collegeName: college.name })
    }
})

module.exports = router