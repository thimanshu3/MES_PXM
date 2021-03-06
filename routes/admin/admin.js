const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/admin/dashboard'))

router.use('/dashboard', require('./dashboard'))

router.use('/addUser', require('./addUser'))

router.use('/attributeset', require('./AttributeSet'))

router.use('/attributesetValue', require('./AttributeSetValue'))

router.use('/users', require('./users'))

router.use('/user', require('./user'))

router.use('/Distributor', require('./Distributor'))

router.use('/Manufacturer', require('./Manufacturer'))

router.use('/loginreport', require('./loginReport'))

router.use('/inputfield', require('./inputField'))

router.use('/listrecord', require('./listRecord'))

router.use('/customform', require('./customForm'))

router.get('/importRawData', (req, res) => {
    res.render('admin/importRawData', { User: req.user })
})






module.exports = router