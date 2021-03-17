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

router.use('/importrawdata',require('./importRawData'))

router.use('/catalog', require('./Catalogue'))

router.use('/cataloghierarchy', require('./CatalogHierarchy'))

router.use('/metainfo', require('./metaInfo'))

router.use('/form', require('./form'))

router.use('/product', require('./product'))

router.use('/kktest',async (req, res) => {
res.render('admin/kktest', { User: req.user })
})

router.use('/kktest2', async (req, res) => {
    res.render('admin/kktest2', { User: req.user })
})

router.use('/kktest4', async (req, res) => {
    res.render('admin/kktest4', { User: req.user })
})

router.use('/kktest5', async (req, res) => {
    res.render('admin/kktest5', { User: req.user })
})

router.use('/kktest6', async (req, res) => {
    res.render('admin/kktest6', { User: req.user })
})


module.exports = router