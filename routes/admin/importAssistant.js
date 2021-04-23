const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')
const { productTable, form, Catalogue, CatalogueHierarchy, FormDesign, productData, productMetaData, productSpecificTableData } = require('../../models')
const { random } = require('../../util')
const { v4: uuidv4 } = require('uuid')
const memoizee = require('memoizee')
const async = require('async')

const { MySql } = require('../../db')
const router = express.Router()

const uploadStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const excelFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const excelUpload = multer({
    storage: uploadStorage,
    fileFilter: excelFilter
})

const mGetFormId = memoizee(async name => {
    const f = await form.findOne({ where: { name } })
    if (f) return f.id
    return ''
}, { promise: true, maxAge: 1000 * 60 * 60 })

const mGetCatalogueId = memoizee(async name => {
    const f = await Catalogue.findOne({
        where: {
            text: name
        }
    })
    if (f) return f.id
    return ''
}, { promise: true, maxAge: 1000 * 60 * 60 })

const mGetCatalogueHeirarchyId = memoizee(async name => {
    const f = await CatalogueHierarchy.findOne({ where: { name } })
    if (f) return f.id
    return ''
}, { promise: true, maxAge: 1000 * 60 * 60 })

const mGetAllFields = memoizee(async formId => {
    const f = await FormDesign.findOne({ formId }, { allFields: 1 })
    if (f) return f.allFields
    return ''
}, { promise: true, maxAge: 1000 * 60 * 60 })

router.get('/', async (req, res) => {
    const [fields] = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr,inputFields.required as req, inputTypes.inputType from inputFields INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')
    const vendor = await productTable.findAll()
    res.render('admin/importAssistant', { User: req.user, fields, vendor })
})

router.post('/', excelUpload.single('file'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            req.flash('error', req.fileValidationError)
            res.redirect('/admin/addUser')
            return
        }
        let { mappingsData, type, vendors } = req.body
        mappingsData = JSON.parse(mappingsData)
        vendors = Object.values(JSON.parse(vendors))
        // TODO query with type
        // console.log({ type })
        if (!Array.isArray(mappingsData) && !mappingsData.length) {
            return res.status(400).json({ message: 'No Mappings' })
        }
        const excelDataRaw = await readXlsxFile(`uploads/${req.file.filename}`)
        fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        const headers = Object.values(excelDataRaw.shift()).map(v => v.trim())
        const excelData = []
        excelDataRaw.forEach(d => {
            const obj = {}
            headers.forEach((h, i) => {
                obj[h] = d[i]
            })
            excelData.push(obj)
        })
        const data = []
        await Promise.all(
            excelData.map(async (sd, index) => {
                index++
                const obj = {}
                if (!sd.form) {
                    res.json({ message: `form id not found at row no. ${index}`, status: 400})
                return
                }
                if (!sd.Catalogue) {
                    res.json({ message: `Catalogue id not found at row no. ${index}` , status: 400})
                 return 
                }
                if (!sd['Catalogue hierarchy']) {
                    res.json({ message: `Catalogue hierarchy id not found at row no. ${index}`, status: 400 })
                return
             }
                obj.formId = await mGetFormId(sd.form)
                obj.Catalogue = await mGetCatalogueId(sd.Catalogue)
                obj.CatalogueHierarchy = await mGetCatalogueHeirarchyId(sd['Catalogue hierarchy'])
                mappingsData.map(md => {
                    const { from, to } = md
                    if (from && to && from.trim() && to.trim()) {
                        obj[md.fieldId] = sd[from.trim()]
                        if (md.fieldId && !obj[md.fieldId]) obj[md.fieldId] = md.default
                    }
                })
                obj.vendors = []
                vendors.forEach(vendor => {
                    const vendorsArr = []
                    vendor.forEach(f => {
                        const v = {}
                        v.fieldId = f.fieldId
                        if (f.from && f.from.trim())
                            v.fieldValue = sd[f.from.trim()]
                        else v.fieldValue = 'ohnoohnoohnoohnoohno'
                        vendorsArr.push(v)
                    })
                    obj.vendors.push(vendorsArr)
                })
                if (sd.name) {
                    obj.name = sd.name
                } else if (sd.Name) obj.name = sd.Name
                data.push(obj)
            })
        )
        const productMeta = []
        const productData1 = []
        const vendorsData = []
        await Promise.all(data.map(async d => {
            const id = uuidv4()
            const allFields = await mGetAllFields(d.formId)
            if (!allFields) return
            allFields.forEach(fieldId => {
                productData1.push({
                    productId: id,
                    fieldId,
                    fieldValue: d[fieldId] || ''
                })
            })
            d.vendors.forEach(v => {
                vendorsData.push({ productId: id, createdBy: req.user.id, data: JSON.stringify(v), tableId: '1' })
            })
            if (!d.Catalogue) console.log('NO CAT')
            if (!d.CatalogueHierarchy) console.log('d.CatalogueHierarchy')
            productMeta.push({ id, createdBy: req.user.id, formId: d.formId, name: d.name ? d.name : undefined, Catalogue: d.Catalogue,CatalogueHierarchy: d.CatalogueHierarchy, stage: 2, productType: 'Item' })
        }))
        await async.parallel([
            async () => await productMetaData.bulkCreate(productMeta),
            async () => await productData.bulkCreate(productData1),
            async () => await productSpecificTableData.bulkCreate(vendorsData)
        ])
        res.status(200).json({ productData: productData1, productMeta, vendorsData, data })
    } catch (err) {
        res.status(500).json({message: err.toString() || 'Something Went Wrong!'})
    }
})

module.exports = router