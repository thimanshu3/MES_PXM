const express = require('express')
const async = require('async')

const { College, User, Specialization } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [college, spoc, faculties, specializations] = await async.parallel([
            async () => await College.findOne({
                where: {
                    id: req.user.college
                }
            }),
            async () => await User.findOne({
                where: {
                    role: 1,
                    college: req.user.college
                }
            }),
            async () => await User.findAll({
                where: {
                    role: 2,
                    college: req.user.college,
                    active: true
                }
            }),
            async () => await Specialization.findAll()
        ])
        if (!college) {
            console.log('\x1b[31m%s\x1b[0m', 'Student has no college!')
            req.flash('Something Went Wrong!')
            res.redirect('/')
            return
        }

        if (!spoc) {
            console.log('\x1b[31m%s\x1b[0m', 'Student has no spoc in college!')
            req.flash('Something Went Wrong!')
            res.redirect('/')
            return
        }

        const specialization = {};
        specializations.forEach(s => specialization[s.id] = s.name);

        res.render('student/branding', { User: req.user, college, spoc, faculties, specialization })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router