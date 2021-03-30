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

router.use('/importassistant', require('./importAssistant'))

router.use('/kktest',async (req, res) => {
res.render('admin/kktest', { User: req.user })
})

router.use('/kktest2', async (req, res) => {
    res.render('admin/kktest2', { User: req.user })
})

router.use('/kktest5', async (req, res) => {
    res.render('admin/kktest5', { User: req.user })
})

router.use('/usersettings', async (req, res) => {
    res.render('admin/usersettings', { User: req.user })
})

router.use('/importassistant', async (req, res) => {
    res.render('admin/importAssistant', { User: req.user })
})

router.use('/importsteps', async (req, res) => {
    res.render('admin/importsteps', { User: req.user })
})
module.exports = router