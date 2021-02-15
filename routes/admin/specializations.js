const express = require('express')

const { Specialization } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    const specializations = await Specialization.findAll()
    res.render('admin/specializations', { User: req.user, specializations })
})

router.post('/', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/specializations')
        return
    }
    try {
        const specialization = await Specialization.create({ name })
        req.flash('success', `${specialization.name} Added Successfully!`)
        res.redirect('/admin/specializations')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/specializations')
    }
})

module.exports = router