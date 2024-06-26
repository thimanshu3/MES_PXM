const express = require('express')

const { MySql } = require('../../db')
const { productMetaData, FormDesign, productData } = require('../../models')

const router = express.Router()

router.get('/:formId/product/:productId', async (req, res) => {
    try {
        let layout = await FormDesign.findOne({ formId: req.params.formId })
        layout = layout.toObject()

        await Promise.all(layout.componets.map(async component => {
            if (component.type == 'sec') {
                await Promise.all(component.subComponents.map(async subComponent => {
                    if (subComponent.type == 'sec') {
                        await Promise.all(subComponent.AssignedFields.map(async a => {
                            const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else null  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
                            delete a.fieldId
                            a.field = fields[0][0]
                        }))
                    } else {
                        await Promise.all(subComponent.tabComponents.map(async tabComponent => {
                            await Promise.all(tabComponent.pageContent.map(async page => {
                                await Promise.all(page.AssignedFields.map(async a => {
                                    const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else null  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
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
                            const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else null  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
                            delete a.fieldId
                            a.field = fields[0][0]
                        }))
                    }))
                }))
            }
        }))
        res.render('admin/addProductFrom', { User: req.user, layout, productId: req.params.productId, formId: req.params.formId })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

//Add Product to a Form
router.post('/', async (req, res) => {
    try {
        const { formId, productId: pid } = req.body
        const fd = await FormDesign.findOne({ formId }, { allFields: 1 })
        if (!fd) return
        await productData.bulkCreate(fd.allFields.map(fieldId => ({
            fieldId,
            fieldValue: req.body[fieldId] || '',
            createdBy: req.user.id,
            productId: pid
        })))
        await productMetaData.update({ stage: '2' }, { where: { id: pid } })
        res.redirect(`/admin/product/${formId}/p/${pid}`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router