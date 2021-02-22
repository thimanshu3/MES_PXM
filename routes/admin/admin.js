const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/admin/dashboard'))

router.use('/dashboard', require('./dashboard'))
// router.use('/users', require('./users'))
router.use('/addUser', require('./addUser'))

router.use('/attributeset', require('./AttributeSet'))

router.use('/attributesetValue', require('./AttributeSetValue'))

router.use('/users', require('./users'))

router.use('/user', require('./user'))

router.use('/Distributor', require('./Distributor'))

router.use('/Manufacturer', require('./Manufacturer'))

router.use('/loginreport', require('./loginReport'))



module.exports = router