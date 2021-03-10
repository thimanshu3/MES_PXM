const express = require('express')
const { Op } = require('sequelize')
const async = require('async')
const { MySql } = require('../../db')
const { ActivityLog, FormDesign, formParts, form, inputFields , fieldGroups, fieldsAssignedToGroup } = require('../../models')
const { formatDateMoment } = require('../../util')
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const customForm = await form.findAll()
        res.render('admin/customForm', { User: req.user, customForm, formatDateMoment })

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
    const { formId, content } = req.body
    if (!content) return res.status(400).json({ status: 400, message: 'content is required!' })
    if (!formId) return res.status(400).json({ status: 400, message: 'Form ID is required!' })
    try {

      const result = await FormDesign.create({ formId, componets:content})
      if(result){
          res.json({ status: 200, href: `/admin/customform/${formId}/fieldmap`})
      }else{
          req.flash('error', `Something Went Wrong`)
          res.redirect('/admin/customform')
      }
        
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/customform')
    }
})


router.get('/:id', async (req, res) => {
    try {
        const formPart = await formParts.findAll()
        const customForm = await form.findOne({
            where: {
                id: req.params.id
            }
        })
        res.render('admin/customFormDesign', { User: req.user, customForm, formatDateMoment, formPart })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id/fieldmap', async (req, res) => {
    try {
        const customForm = await form.findOne({
            where: {
                id: req.params.id
            }
        })
        if(!customForm){
            // res.redirect()
        }
        const [itemFields, itemGroups , formData] = await async.parallel([
            async () => await inputFields.findAll({ attributes: ['id', 'label'], where: { active:true}}),
            async () => await MySql.query('select fatg.groupId as groupId, fg.name, group_concat(fatg.fieldId Separator "," ) as fieldIds from fieldsAssignedToGroups fatg inner join fieldGroups fg on groupId = fg.id inner join inputFields ipf on fatg.fieldId =  ipf.id  where ipf.active="1" group by fatg.groupid'),
            async () => await FormDesign.findOne({formId:customForm.id})
        ])
        res.render('admin/customFormFieldMapping', { User: req.user,data:{itemFields , itemGroups:itemGroups[0], formData} })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router
