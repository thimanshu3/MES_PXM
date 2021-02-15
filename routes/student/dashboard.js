const express = require('express')
const { promisify } = require('util')

const { Redis } = require('../../db')
const { College } = require('../../models')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const college = await redisGet(`student${req.user.id}DashboardCollegeName`)
        if (college) {
            res.render('student/dashboard', { User: req.user, collegeName: college })
        } else {
            const college = await College.findOne({
                where: {
                    id: req.user.college
                },
                attributes: [
                    'name'
                ]
            })
            Redis.setex(`student${req.user.id}DashboardCollegeName`, 600, college.name)
            res.render('student/dashboard', { User: req.user, collegeName: college.name })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router