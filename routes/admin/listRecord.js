const { Op } = require('sequelize')
const express = require('express')
const bcrypt = require('bcryptjs')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')
const { random } = require('../../util')
const { formatDateMoment } = require('../../util')

const { MySql } = require('../../db')
const { ActivityLog, listRecord, listRecordValues, inputFields } = require('../../models')
const { addInputFieldSchema } = require('../../validation')
const { Router } = require('express')
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
//Fetching all the existing List Records
router.get('/', async (req, res) => {
    const data = await listRecord.findAll()
    res.render('admin/listRecord', { User: req.user, attr: data })
})
//Getting records for a specific list
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
        // console.log(listRecordv)
        res.render('admin/listRecordValue', { User: req.user, listRecordv, foundList })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!', error: err.toString() })
    }
})

//Adding values to a ListRecord
router.post('/add', async (req, res) => {
    const { name, tagValues } = req.body
    const values = tagValues.split(',')
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/listRecord')
        return
    }

    if (!Array.isArray(values) && values.length) {
        req.flash('error', 'Something went Wrong, Try again in a while!!')
        res.redirect('/admin/listRecord')
        return
    }
    if (!values.length) {
        req.flash('error', 'Empty List cannot be Added!!')
        res.redirect('/admin/listRecord')
        return
    }

    try {
        const ListRecord = await listRecord.create({ name, createdBy: req.user.id })
        if (ListRecord) {
            await listRecordValues.bulkCreate(values.map(s => ({
                parentListId: ListRecord.id,
                label: s,
                createdBy: req.user.id,
            })))

        }
        else {
            req.flash('error', 'Something Went Wrong Please try after a while')
            res.redirect('/admin/listRecord')
            return
        }

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

//Adding Values of a particular List
router.post('/:id/add', async (req, res) => {
    const { label } = req.body
    const parentListRecord = await listRecord.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!label) {
        req.flash('error', 'Value is required!')
        res.redirect(`/admin/${req.params.id}/listRecordValue`)
        return
    }
    if (!parentListRecord) {
        req.flash('error', 'parent id is required')
        res.redirect(`/admin/${req.params.id}/listRecordValue`)
        return
    }

    try {
        const listrecord = await listRecordValues.create({ label, parentListId: parentListRecord.id, createdBy: req.user.id })
        //req.flash('success', `Added Successfully!!`)
        res.json({ status: 200, message: 'Added Successfully' })
        //res.redirect(`/admin/listrecord/${parentListRecord.id}`)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect(`/admin/${req.params.id}/listRecordValue`)
    }
})
// Active/Inactive List
router.delete('/:id', async (req, res) => {
    const foundList = await listRecord.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundList)
        return res.status(404).json({ message: 'List Not Found!' })

    foundList.active = !foundList.active
    await foundList.save()

    res.json({ status: 200, message: `List/Record ${foundList.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundList.active })
})
// Delete listRecord Permanently
router.delete('/remove/:id', async (req, res) => {
    try {
        await async.parallel([
            async () =>
                await listRecord.destroy({
                    where: {
                        id: req.params.id
                    }
                }),
            async () =>
                await listRecordValues.destroy({
                    where: {
                        parentListId: req.params.id
                    }
                })
        ])
        req.flash('success', `Deleted Successfully`)
        res.json({ status: 200, message: 'Deleted Successfully' })
        res.redirect('/admin/listrecord')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})
// Active/Inactive Values Of a ListRecord
router.delete('/value/:id', async (req, res) => {
    const foundListValue = await listRecordValues.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundListValue)
        return res.status(404).json({ message: 'Value Not Found!' })

    foundListValue.active = !foundListValue.active
    await foundListValue.save()

    res.json({ status: 200, message: `Value ${foundListValue.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundListValue.active })
})
// Delete Values Of a ListRecord Permanently
router.delete('/value/remove/:id', async (req, res) => {
    try {
        const listRecordValue = await listRecordValues.destroy({
            where: {
                id: req.params.id
            }
        })
        req.flash('success', `Deleted Successfully`)
        res.json({ status: 200, message: 'Deleted Successfully' })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})
// Updating Names of ListRecord
router.patch('/:id', async (req, res) => {
    const { newValue } = req.body
    try {
        await listRecord.update({
            name: newValue,
            updatedBy: req.params.id
        }, {
            where: { id: req.params.id },
            returning: true,
            plain: true
        })

        await ActivityLog.create({
            id: req.params.id,
            name: 'List/Record',
            type: 'Update',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `Successfully Updated to ${newValue}!!`)
        res.json({ status: 200 })
    }
    catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/Manufacturer')
    }
})

//Updating Values of a List Record
router.patch('/value/:id', async (req, res) => {
    const { newValue } = req.body
    try {
        await listRecordValues.update({
            label: newValue,
            updatedBy: req.user.id
        }, {
            where: { id: req.params.id },
            returning: true,
            plain: true
        })

        await ActivityLog.create({
            id: req.params.id,
            name: 'List/Record',
            type: 'Update',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `Successfully Updated to ${newValue}!!`)
        res.json({ status: 200 })
    }
    catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/Manufacturer')
    }
})


// Import Input list record File
router.post('/import', excelUpload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/listrecord')
        return
    }
    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)


    if (excelData.length === 0) {
        req.flash('error', 'No List record to Add!')
        res.redirect('/admin/listrecord')
        return
    }
    const data = [];
    Promise
        .all(excelData.map(async (row, index) => {
            try {
                const list = await listRecord.create({ name: row[0].toString(), createdBy: req.user.id, })
                row.map(async a => {
                    if (a != null) {
                        console.log(a);
                        data.push({ parentListId: list.id, createdBy: req.user.id, label: a })
                    }
                })
            } catch (err) {
                throw new Error(err.toString() + ` at Sr. No. ${++index}`)
            }
        }))
        .then(async () => {
            let transaction
            try {
                transaction = await MySql.transaction()
                await listRecordValues.bulkCreate(data, { transaction })
                await transaction.commit()
                req.flash('success', 'list record Import Completed!')
                res.redirect(`/admin/listrecord`)
            } catch (err) {
                console.log(err)
                if (transaction)
                    await transaction.rollback()
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString())
                res.redirect(`/admin/listrecord`)
            }
        })

        .catch(err => {
            console.log(err)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/listrecord')
        })
})

router.get('/getByInputFieldId/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { associatedList } = await inputFields.findOne({ where: { id }, attributes: ['associatedList'] })
        if (!associatedList || associatedList === '-') {
            res.json({ show: false })
        } else {
            const values = await listRecordValues.findAll({ where: { parentListId: associatedList, active: true }, attributes: ['id', 'label'] })
            res.json({ show: true, values })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: err.toString(), message: 'Something Went Wrong!' })
    }
})
module.exports = router