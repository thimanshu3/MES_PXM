const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const catalogue = await Catalogue.findAll()        
        res.render('admin/kktest4', { User: req.user, catalogue, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.patch('/update/:id', async (req, res) => {
    try {
        await Catalogue.update({
            text: req.body.text,
            updatedBy: req.user.id
        }, {
            where: { id: req.params.id },
            returning: true,
            plain: true
        })
        req.flash('success', `Updated Successfully`)
        res.status(200).json({ status: 200, message: 'Updated Successfully' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})

router.delete('/remove/:id', async (req, res) => {
    try {
        await Catalogue.destroy({
            where: {
                id: req.params.id
            }
        })
        req.flash('success', `Deleted Successfully`)
        res.status(200).json({ status: 200, message: 'Deleted Successfully' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})


module.exports = router