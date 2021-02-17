const express = require('express')

const { checkAuthenticated, checkNotAuthenticated, checkUserAdmin} = require('../middlewares')

const router = express.Router()

router.get('/', checkAuthenticated, (req, res) => {
    switch (req.user.role) {
        case 0:
            res.redirect('/admin')
            break
        case 1:
            res.redirect('/productmanager')
            break
        case 2:
            res.redirect('/poweruser')
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


module.exports = router