const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue, CatalogueHierarchy , form } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const catalogues = await CatalogueHierarchy.findAll()
        const forms = await form.findAll()
        res.render('admin/kktest6', { User: req.user, formatDateMoment, catalogues , forms })
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
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})



module.exports = router