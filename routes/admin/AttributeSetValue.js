const express = require('express')
const { Op } = require('sequelize')
const async = require('async')


const { MySql } = require('../../db')
const { AttributeValueSets, AttributeSet } = require('../../models')
const router = express.Router()


router.post('/:id/add', async (req, res) => {
    const { name, parentAttributeId } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/AttributeSetValue')
        return
    }
    if (!parentAttributeId) {
        req.flash('error', 'Parent Attribute is required!') 
        res.redirect('/admin/AttributeSetValue')
        return
    }
    try {
        if (name && parentAttributeId){
            const attribute = await AttributeValueSets.create({ name, parentAttributeId })
            req.flash('success', `${attribute.name} Added Successfully!`)
            res.redirect('/admin/AttributeSetValue')
        }
        
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/AttributeSetValue')
    }
})

router.delete('/remove/:id', async (req, res) => {
    try {
        const attribute = await AttributeValueSets.destroy({
            where: {
                id: req.params.id
            }
        })
        req.flash('success', `Deleted Successfully`)
        res.json({ status: 200, message: 'Deleted Successfully' })
        res.redirect('/admin/AttributeSetValue')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

module.exports = router
