const express = require('express')
const { Op } = require('sequelize')
const async = require('async')


const { MySql } = require('../../db')
const { AttributeValueSets, AttributeSet,ActivityLog } = require('../../models')
const router = express.Router()

router.get('/:id', async (req, res) => {
    try {
        const foundAttribute = await AttributeSet.findOne({
            where: {
                id: req.params.id,
            }
        })

        if (!foundAttribute) {
            req.flash('error', 'Attribute Not Found!')
            res.redirect('/admin/AttributeSet')
            return
        }
        const attributeValues = await AttributeValueSets.findAll({
            where: {
                parentAttributeId: foundAttribute.id
            },
        })
        await ActivityLog.create({
            id: req.params.id,
            name: 'Attribute Set',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('admin/AttributeSetValue', { User: req.user, attributeValues, foundAttribute })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!', error: err.toString() })
    }
})

router.post('/:id/add', async (req, res) => {
    const name = req.body.label
    const parentAttributeId = req.params.id
    if (!name) {
        req.flash('error', 'Name is Required!')
        res.redirect(`/admin/attributesetValue/${parentAttributeId}`)
        return
    }
    // if (!parentAttributeId) {
    //     req.flash('error', 'Parent Attribute is required!') 
    //     res.redirect('/admin/AttributeSetValue')
    //     return
    // }
    try {
        if (name){
            const attribute = await AttributeValueSets.findOrCreate({
                where: {name, parentAttributeId},
                defaults: {name,parentAttributeId, createdBy: req.user.id}
            })
            console.log(attribute[1]);
            res.json({ status: 200, message: (attribute[1]==true ? 'Added Successfully!!': 'Value Already Exists!!') })
            // req.flash('success', `${attribute.name} Added Successfully!`)
            // res.redirect(`/admin/attributset/${parentAttributeId}`)
        }
        
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect(`/admin/attributsetValue/${parentAttributeId}`)
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
