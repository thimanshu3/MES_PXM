const express = require('express')

const { MySql } = require('../../db')
const { User, LoginReport } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [result] = await MySql.query('SELECT users.id AS id, count(loginReports.id) AS loginCount, loginReports.createdAt AS lastLogin, users.email AS email, users.firstName AS firstName, users.lastName AS lastName, users.active AS active, users.role AS role FROM users LEFT JOIN (SELECT * FROM loginReports ORDER BY createdAt DESC) loginReports ON users.id = loginReports.user')
        console.log(result)
        res.render('admin/loginReport', { User: req.user, loginReports: result, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const foundUser = await User.findOne({
            where: {
                id: req.params.id,
                role: [1, 2]
            }
        })

        if (!foundUser)
            return res.status(404).json({ status: 404, message: 'User Does Not Exists!' })

        const loginReport = await LoginReport.findAll({
            where: {
                user: foundUser.id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })

        res.json({ status: 200, data: { loginReport } })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!', error: err.toString() })
    }
})

module.exports = router