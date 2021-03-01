const express = require('express')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const { AttributeSet, AttributeValueSets, ActivityLog } = require('../../models')
const router = express.Router()


router.get('/', async (req, res) => {
    const data = await AttributeSet.findAll()
  
    res.render('admin/AttributeSet', { User: req.user, attr: data })
})

router.get('/:id', async (req, res) => {
    try {
        const foundAttribute = await AttributeSet.findOne({
            where: {
                id: req.params.id,
            }
        })

        if (!foundAttribute){
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


router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/AttributeSet')
        return
    }
    try {
        const attribute = await AttributeSet.create({ name })
        await ActivityLog.create({
            id: attribute.id,
            name: 'Attribute Set',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `${attribute.name} Added Successfully!`)
        res.redirect('/admin/AttributeSet')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/AttributeSet')
    }
})

router.post('/:id/add', async (req, res) => {
    const { name } = req.body
    const parentAttribute = await AttributeSet.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/AttributeSetValue')
        return
    }
    if (!parentAttribute) {
        req.flash('error', 'parent id is required')
        res.redirect('/admin/AttributeSetValue')
        return
    }

    try {
        const attribute = await AttributeValueSets.create({ name, parentAttributeId: parentAttribute.id })
        req.flash('success', `${attribute.name} Added Successfully!`)
        res.redirect(`/admin/AttributeSet/${parentAttribute.id}`)
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
        const attribute = await AttributeSet.destroy({
            where: {
                id: req.params.id
            }
        })
        req.flash('success', `Deleted Successfully`)
        res.json({ status: 200, message: 'Deleted Successfully' })
        res.redirect('/admin/AttributeSet')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

router.patch('/:id', async (req, res) => {
    const attribute = await AttributeSet.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!attribute)
        return res.status(404).json({ message: 'User Not Found!' })

    const { name } = req.body

    if (!name)
        return res.status(400).json({ message: 'Attribute Name is required!' })

    attribute.name = name;

    try {
        await attribute.save()
        res.json({ status: 200, message: 'Attribute Updated Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            return res.status(400).json({ message: `${err.errors[0].message} '${err.errors[0].value}' already exists!` })
        return res.status(500).json({ message: err.toString() || 'Somthing Went Wrong!' })
    }
})

module.exports = router
