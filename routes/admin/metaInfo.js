const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue, CatalogueHierarchy, form, productMetaData } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const catalogues = await CatalogueHierarchy.findAll()
        const forms = await form.findAll()
        res.render('admin/metaInfo', { User: req.user, formatDateMoment, catalogues, forms })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})
router.get('/:id', async (req, res) => {
    try {
        const catalog = await Catalogue.findAll({ where: { CatalogueHierarchy: req.params.id } })
        res.json({ status: 200, catalog })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.json({ message: err.toString() || 'Something went wrong', status: 500 })
    }
})

router.post('/', async (req, res) => {
    const { CatalogueHierarchy, productType, Catalogue, formId, name } = req.body

    try {
        const result = await productMetaData.create({ id: Math.floor(100000 + Math.random() * 90000000), formId, Catalogue, CatalogueHierarchy, productType, createdBy: req.user.id, name })
        if (result)
            res.json({ status: 200, message: 'Added Successfully', href: `/admin/form/${formId}/product/${result.id}` })
        else
            res.json({ status: 500, message: 'something went wrong please try again after some time' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            res.json({ status: 500, message: `${err.errors[0].message} '${err.errors[0].value}' already exists!` })
        else
            res.json({ status: 500, message: err.toString() || 'Something Went Wrong!' })
    }
})

module.exports = router