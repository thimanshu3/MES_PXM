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

        if (!foundList) {
            req.flash('error', 'List record Not Found!')
            res.redirect('/admin/listRecord')
            return
        }
        const listRecordv = await listRecordValues.findAll({
            where: {
                parentListId: foundList.id
            },
        })
        await ActivityLog.create({
            id: req.params.id,
            name: 'List record value',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        console.log(listRecordv)
        res.render('admin/listRecordValue', { User: req.user, listRecordv, foundList })
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
        res.redirect('/admin/listRecord')
        return
    }

    if (!Array.isArray(values) && values.length) {
        req.flash('error', 'values are required!')
        res.redirect('/admin/listRecord')
        return
    }

    try {
        const ListRecord = await listRecord.create({ name, createdBy: req.user.id })
        await listRecordValues.bulkCreate(values.map(s => ({
            parentListId: ListRecord.id,
            label: s,
            createdBy: req.user.id,
        })))
        
        await ActivityLog.create({
            id: ListRecord.id,
            name: 'List record',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `${ListRecord.name} Added Successfully!`)
        res.redirect('/admin/listRecord')

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/listRecord')
    }
})

router.post('/:id/add', async (req, res) => {
    const { label } = req.body
    const parentListRecord = await listRecord.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!label) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/listRecordValue')
        return
    }
    if (!parentListRecord) {
        req.flash('error', 'parent id is required')
        res.redirect('/admin/listRecordValue')
        return
    }

    try {
        const listrecord = await listRecordValues.create({ label, parentListId: parentListRecord.id, createdBy: req.user.id })
        req.flash('success', `${listrecord.name} Added Successfully!`)
        res.redirect(`/admin/listrecord/${parentListRecord.id}`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/listRecordValue')
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
 