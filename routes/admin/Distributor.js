const express = require('express')

const { Distributor } = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    const Distributors = await Distributor.findAll( )
    res.render('admin/distributor', { User: req.user, attr: Distributors })
})

router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/Distributor')
        return
    }
    try {
        const distributor = await Distributor.create({ name , createdBy: req.user.id })
        req.flash('success', `${distributor.name} Added Successfully!`)
        res.redirect('/admin/Distributor')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/Distributor')
    }
})


router.delete('/remove/:id', async (req, res) => {
    try {
        const distributor = await Distributor.findOne({
            where: {
                id: req.params.id
            }
        })
        if(!distributor)
            return res.status(404).json({ message: 'Distributor Not Found!' })
        try {
            distributor.destroy();
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
        res.redirect('/admin/Distributor')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

module.exports = router