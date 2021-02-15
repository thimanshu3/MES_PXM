const express = require('express')

const { checkAuthenticated, checkNotAuthenticated, checkUserAdmin, checkUserSpoc, checkUserFaculty, checkUserStudent } = require('../middlewares')

const router = express.Router()

router.get('/', checkAuthenticated, (req, res) => {
    switch (req.user.role) {
        case 0:
            res.redirect('/admin')
            break
        case 1:
            res.redirect('/spoc')
            break
        case 2:
            res.redirect('/faculty')
            break
        case 3:
            res.redirect('/student')
            break
        default:
            req.logOut()
            res.redirect('/login')
            break
    }
})

router.get('/login', checkNotAuthenticated, (req, res) => res.render('user/login'))
router.get('/forgotPassword', checkNotAuthenticated, (req, res) => res.render('user/forgotPassword'))

router.use('/user', require('./user/user'))
router.use('/admin', checkAuthenticated, checkUserAdmin, require('./admin/admin'))
router.use('/spoc', checkAuthenticated, checkUserSpoc, require('./spoc/spoc'))
router.use('/faculty', checkAuthenticated, checkUserFaculty, require('./faculty/faculty'))
router.use('/student', checkAuthenticated, checkUserStudent, require('./student/student'))
router.use('/courseContent', checkAuthenticated, require('./courseContent/courseContent'))

module.exports = router