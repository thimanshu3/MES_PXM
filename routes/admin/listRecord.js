const express = require('express')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const { listRecord, listRecordValues, ActivityLog } = require('../../models')
const router = express.Router()


router.get('/', async (req, res) => {
    const data = await listRecord.findAll()
  
    res.render('admin/listRecord', { User: req.user, attr: data })
})

router.get('/:id', async (req, res) => {
    try {
        const foundList = await listRecord.findOne({
            where: {
                id: req.params.id,
            }
        })

        if (!foundList){
            req.flash('error', 'List record Not Found!')
            res.redirect('/admin/listrecord')
            return
        }
        const listRecordv = await listRecordValues.findAll({
            where: {
                parentAttributeId: listRecordv.id
            },
        })
        await ActivityLog.create({
            id: req.params.id,
            name: 'List record value',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('admin/ListRecordValue', { User: req.user, listRecordv, foundList })
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
