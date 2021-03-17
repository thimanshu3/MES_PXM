const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue, CatalogueHierarchy, form, productMetaData, FormDesign, productData } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/all' , async (req,res)=>{
    try{
        // let finalData = []
        const result = await productMetaData.findAll()
        
        
        res.render('admin/kktest', { User: req.user, result})
    }
    catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:formId/p/:productId', async (req, res) => {
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
        console.log(layout.componets[0].subComponents[0].AssignedFields[0]);
        res.render('admin/kktest2', { User: req.user, layout, productId: req.params.productId })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})


module.exports = router