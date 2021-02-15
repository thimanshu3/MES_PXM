const express = require('express')

const { ActivityLog } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        await ActivityLog.create({
            id: 'faq',
            name: 'FAQ',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('student/faq', { User: req.user })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router