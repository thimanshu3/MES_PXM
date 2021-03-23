const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue,CatalogueHierarchy } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const catalogues = await CatalogueHierarchy.findAll() 
          
        res.render('admin/catalog', { User: req.user, formatDateMoment, catalogues })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})
router.get('/:id', async (req, res) => {
    try {
        const catalog = await Catalogue.findAll({where: {CatalogueHierarchy: req.params.id}})
        res.json({ status: 200, catalog})
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
    }
})




router.post('/', async (req,res) =>{
    try{
        const { text, parentId, catalogueHierarchy } = req.body
        if(!text){
            res.status(400).json({ status: 400, message: 'Node Name not provided' })
            return
        }
        if(!parentId){
            res.status(400).json({ status: 400, message: 'Please provide ParentId' })
            return
        }
        if(!catalogueHierarchy){
            res.status(400).json({ status: 400, message: 'Catalog Hierarchy not selected' })
            return
        }
       const result = await Catalogue.create({ catalogueHierarchy, text, parentId, createdBy: req.user.id })
        req.flash('success', `Added Successfully`)
        res.status(200).json({ status: 200, message: 'Added Successfully' ,result })
    }
    catch(err){
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() })
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