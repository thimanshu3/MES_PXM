const express = require('express')
const { Op } = require('sequelize')
const async = require('async')
const { MySql } = require('../../db')
const { ActivityLog, FormDesign, formParts, form, inputFields, fieldGroups, fieldsAssignedToGroup } = require('../../models')
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
        res.redirect(`/admin/customform/${customForm.id}`)
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

        const result = await FormDesign.create({ formId, componets: content })
        await form.update({ stage:2},{ where:{ id:formId } })
        
        if (result) {
            res.json({ status: 200, href: `/admin/customform/${formId}/fieldmap` })
            req.flash('success',"Form Layout Design Saved")
        } else {
            res.json({status: 404, message: "Something Went Wrong"})
            
        }

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            res.json({ status: 404, message: `${err.errors[0].message} '${err.errors[0].value}' already exists!` })
        else
            res.json({ status: 404, message: err.toString() || 'Something Went Wrong!' })
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
        if (!customForm) {
            req.flash('error', 'Form Not Found')
            res.redirect('/customform')
        }
        const [[itemFields], itemGroups, formData] = await async.parallel([
            async () => await MySql.query(`select inf.id as id, inf.label as label,inf.associatedList as lr, it.inputType as type from inputFields inf inner join inputTypes it on inf.typeofField = it.id where inf.active=true`),
            async () => await MySql.query('select fatg.groupId as groupId, fg.name, group_concat(fatg.fieldId Separator "," ) as fieldIds from fieldsAssignedToGroups fatg inner join fieldGroups fg on groupId = fg.id inner join inputFields ipf on fatg.fieldId =  ipf.id  where ipf.active="1" group by fatg.groupid'),
            async () => await FormDesign.findOne({ formId: customForm.id })
        ])
        console.log(itemFields);
        res.render('admin/customFormFieldMapping', { User: req.user, data: { itemFields, itemGroups: itemGroups[0], formData: formData.toObject() } })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/:id/fieldmap/assign', async (req, res) => {
    const { newForm } = req.body
    try {
        const result = await FormDesign.findOne({ formId: req.params.id })
        result.allFields = newForm.allFields
        result.componets = newForm.componets
        await result.save(function (err, doc) {
            if (err) {
                console.log(err.toString());
                return res.json({ status: 500, message: err.toString() || 'Something went wrong' });
            }
            res.json({ status: 200, message: 'Field Mapped Successfully!' })
        });

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/customform')
    }
})

router.get('/:id/form', async (req, res) => {
    try {
        let layout = await FormDesign.findOne({ formId: req.params.id })
        layout = layout.toObject()

        await Promise.all(layout.componets.map(async component => {
            if (component.type == 'sec') {
                await Promise.all(component.subComponents.map(async subComponent => {
                    if (subComponent.type == 'sec') {
                        await Promise.all(subComponent.AssignedFields.map(async a => {
                            const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else "no value"  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
                            delete a.fieldId
                            a.field = fields[0][0]
                        }))
                    } else {
                        await Promise.all(subComponent.tabComponents.map(async tabComponent => {
                            await Promise.all(tabComponent.pageContent.map(async page => {
                                await Promise.all(page.AssignedFields.map(async a => {
                                    const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
                                    delete a.fieldId
                                    a.field = fields[0][0]
                                }))
                            }))
                        }))
                    }
                }))
            }
            else {
                await Promise.all(component.subComponents.map(async subComponent => {
                    await Promise.all(subComponent.tabComponents.map(async tabComponent => {
                        await Promise.all(tabComponent.AssignedFields.map(async a => {
                            const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
                            delete a.fieldId
                            a.field = fields[0][0]
                        }))
                    }))
                }))
            }
        }))
        res.render('admin/formPreview', { User: req.user, layout })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})


router.delete('/:id', async (req, res) => {
    const foundForm = await form.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundForm)
        return res.status(404).json({ message: 'Form Not Found!' })

    // if (foundAttributeSet.role === 0)
    //     return res.status(400).json({ message: 'Cannot Deactive Admin' })

    foundForm.active = !foundForm.active
    await foundForm.save()

    res.json({ status: 200, message: `Form ${foundForm.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundForm.active })
})

// router.delete('/remove/:id', async (req, res) => {
//     try {
//         await async.parallel([
//             async () =>
//                 await AttributeSet.destroy({
//                     where: {
//                         id: req.params.id
//                     }
//                 }),
//             async () =>
//                 await AttributeValueSets.destroy({
//                     where: {
//                         parentAttributeId: req.params.id
//                     }
//                 })
//         ])
//         req.flash('success', `Deleted Successfully`)
//         res.json({ status: 200, message: 'Deleted Successfully' })
//         res.redirect('/admin/listrecord')
//     } catch (err) {
//         console.error('\x1b[31m%s\x1b[0m', err)
//         res.status(500).json({ status: 500, message: err.toString() })
//     }
// })

module.exports = router
