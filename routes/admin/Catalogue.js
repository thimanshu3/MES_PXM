const express = require('express')

const { MySql } = require('../../db')
const { User, Catalogue } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const mainArr =[]
        const catalogue = await Catalogue.findAll()
        let state = {
            "selected": false,
            "opened": 0
        }
        catalogue.forEach(c=>{
            let parentId = c.parentId
            if(parentId == '0') parentId = '#'
            mainArr.push({id:c.id , parent: parentId , text: c.name , state , type: 'folder'})
        })

        res.render('admin/kktest4', { User: req.user, mainArr, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})



module.exports = router