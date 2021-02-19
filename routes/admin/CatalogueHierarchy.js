const express = require('express')

const { CatalogueHierarchy } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    const Catalogues = await CatalogueHierarchy.findAll()
    res.render('admin/catalogue', { User: req.user, Catalogues })
})

router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/catalogue')
        return
    }
    try {
        const Catalogues = await CatalogueHierarchy.create({ name })
        req.flash('success', `${Catalogues.name} Added Successfully!`)
        res.redirect('/admin/catalogue')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/catalogue')
    }
})

module.exports = router