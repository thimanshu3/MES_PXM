const express = require('express')

const { User, LoginReport } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    try {

        const users =  await User.findAll()
        console.log(users)
        res.render('admin/users', { User: req.user, users })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const foundUser = await User.findOne({
            where: {
                id: req.params.id,
            }
        })

        if (!foundUser) {
            req.flash('error', 'User Not Found!')
            res.redirect('/admin/users')
            return
        }


        let lastLogin = await LoginReport.findOne({
            where: {
                user: req.params.id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })

        if (lastLogin)
            lastLogin = lastLogin.createdAt

        res.render('admin/user', { User: req.user, user: foundUser, formatDateMoment, lastLogin })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})



module.exports = router