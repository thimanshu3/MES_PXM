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
const { inputFields, inputTypes, ActivityLog, fieldGroups, fieldsAssignedToGroup, listRecord , listRecordValues} = require('../../models')
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

// Get data to render on page load
router.get('/', async (req, res) => {
    try {
        const inputType = await inputTypes.findAll()
        const listRecordResult = await listRecord.findAll({
            where: { active: true }
        })
        const inputField = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr, users.firstName as firstName, users.lastName as lastName, inputTypes.inputType from inputFields INNER JOIN users  ON users.id = inputFields.createdBy INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')
        console.log(req.user)
        res.render('admin/inputField', { User: req.user, inputField, inputType, listRecordResult })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

// Import Input Fields File
router.post('/import', excelUpload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/inputfield')
        return
    }

    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
    excelData.shift()

    if (excelData.length === 0) {
        req.flash('error', 'No Field Items to Add!')
        res.redirect('/admin/inputfield')
        return
    }

    Promise
        .all(excelData.map(async (row, index) => {
            try {
                const found = await inputTypes.findOne({
                    where: {
                        inputType: row[1]
                    }
                })
                if (found) {
                    row[1] = found.id
                }
                else {
                    throw new Error(`wrong input type given at Sr. No. ${++index}`)
                }
                return {
                    ...(await addInputFieldSchema.validateAsync({
                        label: row[0],
                        typeOfField: row[1],
                        description: row[2],
                        createdBy: req.user.id
                    }))
                }
            } catch (err) {
                throw new Error(err.toString() + ` at Sr. No. ${++index}`)
            }
        }))
        .then(async data => {
            let transaction

            try {
                transaction = await MySql.transaction()
                await inputFields.bulkCreate(data, { transaction })
                await transaction.commit()
                req.flash('success', 'Item Fields Import Completed!')
                res.redirect(`/admin/inputfield`)
            } catch (err) {
                console.log(err)
                if (transaction)
                    await transaction.rollback()
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString())
                res.redirect(`/admin/inputfield`)
            }
        })

        .catch(err => {
            console.log(err)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/inputfield')
        })
})

//Add an Item Field
router.post('/add', async (req, res) => {
    const { label, type, listrecord, description } = req.body
    console.log(req.body);
    if (!label || !type || !description) {
        req.flash('error', 'Fill All Required Fields')
        res.redirect('/admin/inputfield')
        return
    }
    console.log(listrecord);
    let queryFields = {}
    if (listrecord) {
        console.log("list detected");
        queryFields = { label, createdBy: req.user.id, description, typeOfField: type, associatedList: listrecord }
    }
    else {
        queryFields = { label, createdBy: req.user.id, description, typeOfField: type }
        console.log("list not detected");
    }
    try {
        const inputField = await inputFields.create(queryFields)
        await ActivityLog.create({
            id: inputField.id,
            name: 'input Group',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `${inputField.name} Added Successfully!`)
        res.redirect('/admin/inputfield')
        return
    }
    catch {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/inputfield/inputgroup')
    }
})

// Activate/Deactivate an Item Field
router.delete('/:id', async (req, res) => {
    const foundField = await inputFields.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundField)
        return res.status(404).json({ message: 'Field Not Found!' })

    // if (foundField.role === 0)
    //     return res.status(400).json({ message: 'Cannot Deactive Admin' })

    foundField.active = !foundField.active
    await foundField.save()

    res.json({ status: 200, message: `Field ${foundField.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundField.active })
})

// Delete an Item Field
router.delete('/remove/:id', async (req, res) => {
    const foundField = await inputFields.findOne({
        where: {
            id: req.params.id
        }
    })
    if (!foundField)
        return res.status(404).json({ message: 'Field Not Found!' })
    try {
        foundField.destroy();
        res.json({ status: 200, message: `Field Deleted!` })
        //res.r('/admin/inputField')
    }
    catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

// Get All Field Groups
router.get('/inputgroup', async (req, res) => {
    try {
        const [fieldGroupq] = await MySql.query("select fg.id as id, fg.name as name, fg.active as active, u.firstName as fname, u.lastName as lname, fg.createdBy as createdBy, fg.createdAt as createdAt, count(fatg.groupId) as count from fieldGroups fg INNER JOIN users u ON u.id = fg.createdBy left JOIN fieldsAssignedToGroups fatg on fatg.groupId = fg.id group by fg.id")
        res.render('admin/inputGroup', { User: req.user, fieldGroup: fieldGroupq, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

//Add an Input Group
router.post('/inputgroup/add', async (req, res) => {
    const { name, description } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/inputfield/inputgroup')
        return
    }
    if (!description) {
        req.flash('error', 'description is required!')
        res.redirect('/admin/inputfield/inputgroup')

    }
    try {
        const fieldGroup = await fieldGroups.create({ name, createdBy: req.user.id, description })
        await ActivityLog.create({
            id: fieldGroup.id,
            name: 'input Group',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `${fieldGroup.name} Added Successfully!`)
        res.redirect('/admin/inputfield/inputgroup')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/inputfield')
    }
})

// Show All Input Fields in Selected Group 
router.get('/inputgroup/:id', async (req, res) => {
    try {

        const [itemFields, assignedItemFields] = await async.parallel([
            async () => await inputFields.findAll(),
            async () => await fieldsAssignedToGroup.findAll({
                where: {
                    groupId: req.params.id,
                }
            })
        ])
        const s = []
        itemFields.forEach(itemField => {
            s.push({
                id: itemField.id,
                name: itemField.label,
                isAssigned: assignedItemFields.find(s => s.fieldId === itemField.id) ? true : false
            })
        })
        console.log(s)
        res.json({ status: 200, data: { itemFields: s } })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

// Get Values of a List/Record attached to a Input Field 
router.get('/lrValue/:id', async (req, res) => {
    try {
        const foundList = await listRecord.findOne({
            where: {
                id: req.params.id,
            }
        })

        if (!foundList) {
            res.json({"status":404,"message":"Lit Record Not Found!!"})
        }
        const listRecordv = await listRecordValues.findAll({
            where: {
                parentListId: foundList.id
            },
        })
        console.log(listRecordv);
        res.json({ listRecordv })
    }
    catch(err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!', error: err.toString() })
    }
})


// Assign Item Fields To a Particular Group
router.post('/inputgroup', async (req, res) => {
    const { checked, groupId } = req.body
    if (!groupId)
        return res.status(400).json({ status: 400, message: 'Group Id is required!' })
    if (!(Array.isArray(checked)))
        return res.status(400).json({ status: 400, message: 'Item Fields Must be an Array!' })

    try {

        //const date = new Date()

        if (checked.length === 0)
            return res.status(400).json({ status: 400, message: 'Field items are required' })

        if (checked.length)
        {
            //console.log(groupId);
            await fieldsAssignedToGroup.destroy(
                {
                    where: {
                        groupId: groupId
                    }
                }
            )
            await fieldsAssignedToGroup.bulkCreate(checked.map(s => ({
                groupId,
                fieldId: s,
                AssignedBy: req.user.id,

            })))
        }




        res.json({ status: 200, message: 'Grouped Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})


// Activate/Deactivate a Group
router.delete('/inputgroup/:id', async (req, res) => {
    const foundGroup = await fieldGroups.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundGroup)
        return res.status(404).json({ message: 'Group Not Found!' })

    // if (foundGroup.role === 0)
    //     return res.status(400).json({ message: 'Cannot Deactive Admin' })

    foundGroup.active = !foundGroup.active
    await foundGroup.save()

    res.json({ status: 200, message: `Group ${foundGroup.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundGroup.active })
})


// Delete a Group
router.delete('/inputgroup/remove/:id', async (req, res) => {
    const foundGroup = await fieldGroups.findOne({
        where: {
            id: req.params.id
        }
    })
    if (!foundGroup)
        return res.status(404).json({ message: 'Group Not Found!' })
    try {
        //foundGroup.destroy();
        res.json({ status: 200, message: `DELETE QUERY NEED TO BE WRITTEN` })
        //res.r('/admin/inputField')
    }
    catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router


// router.post('/add', async (req, res) => {
//     const { label, description, type } = req.body
//     if (!label) {
//         req.flash('error', 'name is required!')
//         res.redirect('/admin/inputField')
//         return
//     }
//     if (!description) {
//         req.flash('error', 'description is required!')
//         res.redirect('/admin/inputField')
//         return
//     }
//     if (!type) {
//         req.flash('error', 'type is required!')
//         res.redirect('/admin/inputField')
//         return
//     }
//     console.log(req.body)
//     try {
//         // const inputField = await inputFields.create({ label, typeOfField: type, description, createdBy: req.user.id })
//         // await ActivityLog.create({
//         //     id: inputField.id,
//         //     name: 'input Field',
//         //     type: 'Add',
//         //     user: req.user.id,
//         //     timestamp: new Date()
//         // })
//         req.flash('success', `${inputField.label} Added Successfully!`)
//         res.redirect('/admin/inputField')
//     } catch (err) {
//         console.error('\x1b[31m%s\x1b[0m', err)
//         if (err.name === 'SequelizeUniqueConstraintError')
//             req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
//         else
//             req.flash('error', err.toString() || 'Something Went Wrong!')
//         res.redirect('/admin/inputField')
//     }
// })