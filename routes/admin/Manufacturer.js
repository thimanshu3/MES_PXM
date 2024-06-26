const express = require('express')

const { Manufacturer, ActivityLog } = require('../../models')

const router = express.Router()
//Fetching Existing Manufacturers
router.get('/', async (req, res) => {
    const manufacturer = await Manufacturer.findAll()
    res.render('admin/manufacturer', { User: req.user, attr: manufacturer })
})
//Create Manufacturer
router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/Manufacturer')
        return
    }
    try {
        const manufacturer = await Manufacturer.create({ name, createdBy: req.user.id})
        req.flash('success', `${manufacturer.name} Added Successfully!`)
        res.redirect('/admin/Manufacturer')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/Manufacturer')
    }
})
//Update Manufacturer Name
router.patch('/:id',async(req,res) => {
    const {newValue} = req.body
    try{
        await Manufacturer.update({
            name: newValue,
            updatedBy: req.params.id
        }, {
            where: { id: req.params.id },
            returning: true,
            plain: true
        })

        await ActivityLog.create({
            id: req.params.id,
            name: 'Manufacturer',
            type: 'Update',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `Successfully Updated to ${newValue}!!`)
        res.json({ status: 200 })
    }
    catch(err){
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/Manufacturer')
    }

})
// Active/Inactive Status Manufacturer
router.delete('/:id', async (req, res) => {
    const found = await Manufacturer.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!found)
        return res.status(404).json({ message: 'Value Not Found!' })

    // if (foundList.role === 0)
    //     return res.status(400).json({ message: 'Cannot Deactive Admin' })

    found.active = !found.active
    await found.save()

    res.json({ status: 200, message: `${found.active ? 'Activated' : 'Deactivated'} Successfully!`, active: found.active })
})

//Delete Manufacturer Name
router.delete('/remove/:id', async (req, res) => {
    try {
        const manufacturer = await Manufacturer.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!manufacturer)
            return res.status(404).json({ message: 'Distributor Not Found!' })
        try {
            manufacturer.destroy();
            res.json({ status: 200, message: `Deleted Successfully!` })
            //res.r('/admin/inputField')
        }
        catch (err) {
            console.error('\x1b[31m%s\x1b[0m', err)
            req.flash('error', 'Something Went Wrong!')
            res.redirect('/')
        }
        req.flash('success', `Deleted Successfully`)
        res.json({ status: 200, message: 'Deleted Successfully' })
        res.redirect('/admin/Manufacturer')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

module.exports = router