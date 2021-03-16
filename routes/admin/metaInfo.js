const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue, CatalogueHierarchy , form , productMetaData } = require('../../models')
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

router.post('/', async (req, res) => {
    const { CatalogueHierarchy, productType, Catalogue, formId } = req.body

    try {
        const result = await productMetaData.create({id: 2 ,  formId, Catalogue, CatalogueHierarchy, productType,createdBy: req.user.id })
        
        res.json({ status: 200, message: 'Added Successfully' })
        
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            res.json({status:500 , message: `${err.errors[0].message} '${err.errors[0].value}' already exists!`})
        else
            req.flash({status:500 , message: err.toString() || 'Something Went Wrong!'})
    }
})

module.exports = router