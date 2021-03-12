const express = require('express')
const { Op } = require('sequelize')
const async = require('async')
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


router.post('/add', async (req, res) => {
    const { name, tagValues } = req.body
    const values = tagValues.split(',')
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/AttributeSet')
        return
    }
    if (!Array.isArray(values) && values.length) {
        req.flash('error', 'values are required!')
        res.redirect('/admin/AttributeSet')
        return
    }
    try {
        const attribute = await AttributeSet.create({ name })
        if (attribute) {
            await AttributeValueSets.bulkCreate(values.map(s => ({
                parentAttributeId: attribute.id,
                name: s,
                createdBy: req.user.id,
            })
            ))
        } else {
            req.flash('error', 'Something Went Wrong Please try after a while')
            res.redirect('/admin/AttributeSet')
            return
        }

        await ActivityLog.create({
            id: attribute.id,
            name: 'Attribute Set',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        console.log(values);
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

router.patch('/:id', async (req, res) => {
    const { newValue } = req.body
    try {
        await AttributeSet.update({
            name: newValue,
            updatedBy: req.params.id
        }, {
            where: { id: req.params.id },
            returning: true,
            plain: true
        })

        await ActivityLog.create({
            id: req.params.id,
            name: 'AttributeSet',
            type: 'Update',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `Successfully Updated to ${newValue}!!`)
        res.json({ status: 200 })
    }
    catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/AttributeSet')
    }
})

router.delete('/:id', async (req, res) => {
    const foundAttributeSet = await AttributeSet.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundAttributeSet)
        return res.status(404).json({ message: 'Group Not Found!' })

    // if (foundAttributeSet.role === 0)
    //     return res.status(400).json({ message: 'Cannot Deactive Admin' })

    foundAttributeSet.active = !foundAttributeSet.active
    await foundAttributeSet.save()

    res.json({ status: 200, message: `AttributeSet ${foundAttributeSet.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundAttributeSet.active })
})

router.delete('/remove/:id', async (req, res) => {
    try {
        await async.parallel([
            async () =>
                await AttributeSet.destroy({
                    where: {
                        id: req.params.id
                    }
                }),
            async () =>
                await AttributeValueSets.destroy({
                    where: {
                        parentAttributeId: req.params.id
                    }
                })
        ])
        req.flash('success', `Deleted Successfully`)
        res.json({ status: 200, message: 'Deleted Successfully' })
        res.redirect('/admin/listrecord')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

module.exports = router
