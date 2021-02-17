const express = require('express')

const { Distributor } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    const Distributors = await Distributor.findAll( )
    res.render('admin/distributor', { User: req.user, Distributors })
})

router.post('/', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/distributor')
        return
    }
    try {
        const distributor = await Distributor.create({ name })
        req.flash('success', `${distributor.name} Added Successfully!`)
        res.redirect('/admin/distributor')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/distributor')
    }
})

module.exports = router