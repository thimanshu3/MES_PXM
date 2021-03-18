const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue, CatalogueHierarchy, form, productMetaData , FormDesign , productData } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/:formId/product/:productId', async (req, res) => {
    try {
        let layout = await FormDesign.findOne({ formId: req.params.formId })
        layout = layout.toObject()

        await Promise.all(layout.componets.map(async component => {
            await Promise.all(component.subComponents.map(async subComponent => {
                if (subComponent.type == 'sec') {
                    await Promise.all(subComponent.AssignedFields.map(async a => {
                        const fields = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id = ?', { replacements: [a.fieldId] })
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
        }))
        res.render('admin/addProductFrom', { User: req.user, layout, productId: req.params.productId, formId: req.params.formId})
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})


router.post('/', async (req, res) => {
    try {
        console.log(req.body);
       const formdata = req.body
       const formId = formdata.formId
       delete formdata.formId
       const pid = formdata.productId
       delete formdata.productId
       Promise.all([
        Object.keys(formdata).forEach(async a=>{
            await productData.create({ fieldId: a, fieldValue: formdata[a] , createdBy: req.user.id , productId: pid })
        })
       ])
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