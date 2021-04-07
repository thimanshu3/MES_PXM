const express = require('express')

const { MySql } = require('../../db')
const {  productMetaData, FormDesign, listRecordValues , productTable } = require('../../models')

const router = express.Router()

//
router.get('/all' , async (req,res)=>{
    try{
        const [result] = await MySql.query('SELECT productMetaData.id as id, productMetaData.name as name, productMetaData.formId as formId, productMetaData.active as active,productMetaData.Catalogue as catalogueId, productMetaData.CatalogueHierarchy as catalogueHierarchy, productMetaData.stage as stage, productMetaData.createdBy as createdBy, cat.text as catalogue, ch.name as catalogueHierarchy, pt.name as productType FROM productMetaData inner join Catalogues cat on productMetaData.Catalogue = cat.id inner join CatalogueHierarchies ch on productMetaData.CatalogueHierarchy = ch.id inner join ProductTypes pt on productMetaData.productType = pt.id')
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
        let layout = await FormDesign.findOne({ formId: req.params.id })
        layout = layout.toObject()

        await Promise.all(layout.componets.map(async component => {
            if (component.type == 'sec') {
                await Promise.all(component.subComponents.map(async subComponent => {
                    if (subComponent.type == 'sec') {
                        if (subComponent.AssignedTable !== undefined) {
                            let table = await productTable.findOne({ where: { id: subComponent.AssignedTable } })
                            if (table) {
                                table = table.toJSON()
                                const values = await listRecordValues.findAll({ where: { parentListId: JSON.parse(table.fields)[0].attachedList } })
                                console.log(values);
                                table.values = values
                                subComponent.table = table
                            }
                        }
                        if (subComponent.AssignedFields.length) {
                            const [inputFields2] = await MySql.query(`select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else null  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id IN (${subComponent.AssignedFields.map(f => `"${f.fieldId}"`)})`)
                            const inputFields2Obj = {}
                            inputFields2.forEach(f => {
                                inputFields2Obj[f.id] = f
                            })
                            subComponent.AssignedFields.forEach(a => {
                                a.field = inputFields2Obj[a.fieldId]
                                delete a.fieldId
                            })
                        }
                    } else {
                        await Promise.all(subComponent.tabComponents.map(async tabComponent => {
                            await Promise.all(tabComponent.pageContent.map(async page => {
                                if (page.AssignedTable !== undefined) {
                                    const table = await productTable.findOne({ where: { id: page.AssignedTable } })
                                    page.table = table
                                }
                                if (page.AssignedFields.length) {
                                    const [inputFields1] = await MySql.query(`select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else null  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id IN (${page.AssignedFields.map(af => `"${af.fieldId}"`)})`)
                                    const inputFields1Obj = {}
                                    inputFields1.forEach(f => {
                                        inputFields1Obj[f.id] = f
                                    })
                                    page.AssignedFields.forEach(a => {
                                        a.field = inputFields1Obj[a.fieldId]
                                        delete a.fieldId
                                    })
                                }
                            }))
                        }))
                    }
                }))
            }
            else {
                await Promise.all(component.subComponents.map(async subComponent => {
                    await Promise.all(subComponent.tabComponents.map(async tabComponent => {
                        if (tabComponent.AssignedTable !== undefined) {
                            const table = await productTable.findOne({ where: { id: tabComponent.AssignedTable } })
                            tabComponent.table = table
                        }
                        if (tabComponent.AssignedFields.length) {
                            const [inputFields] = await MySql.query(`select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,Case when inputFields.associatedList != "-"  then (select group_concat(label SEPARATOR "----") from listRecordValues where parentListId = inputFields.associatedList) else null  END as list,inputTypes.inputType from inputFields INNER JOIN inputTypes on inputTypes.id = inputFields.typeOfField where inputFields.id IN (${tabComponent.AssignedFields.map(a => `"${a.fieldId}"`)})`)
                            const inputFieldsObj = {}
                            inputFields.forEach(f => {
                                inputFieldsObj[f.id] = f
                            })
                            tabComponent.AssignedFields.forEach(a => {
                                a.field = inputFieldsObj[a.fieldId]
                                delete a.fieldId
                            })
                        }
                    }))
                }))
            }
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