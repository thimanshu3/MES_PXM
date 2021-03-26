const express = require('express')

const { MySql } = require('../../db')
const { User, CatalogueHierarchy, Catalogue } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()
//Create Catalogue
router.post('/', async (req, res) => {
    // console.log(req.body);
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/catalog')
        return
    }
    try {
        const cataloghierarchy = await CatalogueHierarchy.create({ name, createdBy: req.user.id })
        await Catalogue.create({ id: 1, catalogueHierarchy: cataloghierarchy.id, text: name, parentId: 0, createdBy: req.user.id })
        req.flash('success', `${cataloghierarchy.name} Added Successfully!`)
        res.redirect(`/admin/catalog`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/catalog')
    }
})


module.exports = router