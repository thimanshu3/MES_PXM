const express = require('express')
const async = require('async')
const { promisify } = require('util')

const { Redis } = require('../../db')
const { College, User, Specialization } = require('../../models')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/', async (req, res) => {
    const [students, colleges, faculties, specializations] = await async.parallel([
        async () => await redisGet('adminDashboardNumberOfStudents'),
        async () => await redisGet('adminDashboardNumberOfColleges'),
        async () => await redisGet('adminDashboardNumberOfFaculties'),
        async () => await redisGet('adminDashboardNumberOfSpecializations')
    ])
    if (students && colleges && faculties && specializations)
        res.render('admin/dashboard', { User: req.user, students, colleges, faculties, specializations })
    else {
        const [students, colleges, faculties, specializations] = await async.parallel([
            async () => await User.count({
                where: {
                    role: 3
                }
            }),
            async () => await College.count(),
            async () => await User.count({
                where: {
                    role: 2
                }
            }),
            async () => await Specialization.count()
        ])
        Redis.setex('adminDashboardNumberOfStudents', 600, students)
        Redis.setex('adminDashboardNumberOfColleges', 600, colleges)
        Redis.setex('adminDashboardNumberOfFaculties', 600, faculties)
        Redis.setex('adminDashboardNumberOfSpecializations', 600, specializations)
        res.render('admin/dashboard', { User: req.user, students, colleges, faculties, specializations })
    }
})

module.exports = router