const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue, CatalogueHierarchy, form, productMetaData, FormDesign, productData } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/all' , async (req,res)=>{
    try{
        const [result] = await MySql.query('SELECT productMetaData.id as id, productMetaData.name as name, productMetaData.formId as formId, productMetaData.active as active,productMetaData.Catalogue as catalogueId, productMetaData.CatalogueHierarchy as catalogueHierarchy, productMetaData.productType as productType,productMetaData.createdBy as createdBy, cat.text as catalogue, ch.name as catalogueHierarchy FROM productMetaData Left join Catalogues cat on productMetaData.Catalogue = cat.id left join CatalogueHierarchies ch on productMetaData.CatalogueHierarchy = ch.id')
        console.log(result.length);
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
                        const fields = await MySql.query('select inputFields.id as id, inputFields.active as active, inputFields.label as label, inputFields.description as description, inputFields.associatedList as lr, inputTypes.inputType, productData.productId as pid, productData.fieldValue as pfv from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField INNER join productData on productData.fieldId = inputFields.id where inputFields.id = ? and productData.productId = ?', { replacements: [a.fieldId , req.params.productId] })
                        delete a.fieldId
                        a.field = fields[0][0]
                        
                    }))
                } else {
                    await Promise.all(subComponent.tabComponents.map(async tabComponent => {
                        await Promise.all(tabComponent.pageContent.map(async page => {
                            await Promise.all(page.AssignedFields.map(async a => {
                                const fields = await MySql.query('select inputFields.id as id, inputFields.active as active, inputFields.label as label, inputFields.description as description, inputFields.associatedList as lr, inputTypes.inputType, productData.productId as pid, productData.fieldValue as pfv from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField INNER join productData on productData.fieldId = inputFields.id where inputFields.id = ? and productData.productId = ?', { replacements: [a.fieldId, req.params.productId] })
                                delete a.fieldId
                                a.field = fields[0][0]
                            }))
                        }))
                    }))
                }
            }))
        }))
        const meta = await productMetaData.findOne({where:{id: req.params.productId}})
        res.render('admin/kktest2', { User: req.user, layout, productId: req.params.productId , meta })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})


module.exports = router