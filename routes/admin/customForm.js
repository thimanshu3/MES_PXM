const express = require('express')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const { ActivityLog, formConfig , formParts , form } = require('../../models')
const {formatDateMoment}  = require('../../util')
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const customForm = await form.findAll()
        res.render('admin/customForm', { User: req.user, customForm , formatDateMoment  })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/', async (req, res) => {
    const { name, description } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/customform')
        return
    }
    if (!description) {
        req.flash('error', 'description is required!')
        res.redirect('/admin/customform')
        return
    }
    try {
        const customForm = await form.create({ name, createdBy: req.user.id, description, createdBy: req.user.id })
        await ActivityLog.create({
            id: customForm.id,
            name: 'Form',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `${customForm.name} Added Successfully!`)
        res.redirect('/admin/customform')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/customform')
    }
})


router.post('/layout', async (req, res) => {
    console.log(req.body.AllData)
    // try {
    //     const customForm = await form.create({ name, createdBy: req.user.id, description, createdBy: req.user.id })
    //     await ActivityLog.create({
    //         id: customForm.id,
    //         name: 'Form',
    //         type: 'Add',
    //         user: req.user.id,
    //         timestamp: new Date()
    //     })
    //     req.flash('success', `${customForm.name} Added Successfully!`)
    //     res.redirect('/admin/customform')
    // } catch (err) {
    //     console.error('\x1b[31m%s\x1b[0m', err)
    //     if (err.name === 'SequelizeUniqueConstraintError')
    //         req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
    //     else
    //         req.flash('error', err.toString() || 'Something Went Wrong!')
    //     res.redirect('/admin/customform')
    // }
})


router.get('/:id', async (req, res) => {
    try {
        const formPart = await formParts.findAll()
        const customForm = await form.findOne({
            where:{
                id:req.params.id
            }
        })
        res.render('admin/customFormDesign', { User: req.user, customForm, formatDateMoment,formPart })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})
module.exports = router
