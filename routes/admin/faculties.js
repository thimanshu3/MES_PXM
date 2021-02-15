const express = require('express')
const async = require('async')

const {
    College,
    User,
    Specialization,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    LoginReport
} = require('../../models')
const { formatDate, formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    const [faculties, Colleges, Specializations] = await async.parallel([
        async () => await User.findAll({
            where: {
                role: 2
            }
        }),
        async () => await College.findAll(),
        async () => await Specialization.findAll()
    ])

    const specializations = {}
    const colleges = {}

    Specializations.forEach(s => specializations[s.id] = s.name)
    Colleges.forEach(c => colleges[c.id] = c.name)

    res.render('admin/faculties', { User: req.user, faculties, colleges, specializations })
})

router.get('/:id', async (req, res) => {
    const foundFaculty = await User.findOne({
        where: {
            id: req.params.id,
            role: 2
        }
    })

    if (!foundFaculty) {
        req.flash('error', 'Faculty Not Found!')
        res.redirect('/admin/faculties')
        return
    }

    const [foundCollege, specializations, data1, data2] = await async.parallel([
        async () => await College.findOne({
            where: {
                id: foundFaculty.college
            }
        }),
        async () => await Specialization.findAll(),
        async () => await FacultySemesterAssignment.findAll({
            where: {
                facultyId: req.params.id
            },
            order: [
                ['createdAt', 'DESC'],
                ['semester', 'ASC']
            ]
        }),
        async () => await FacultySpecializationAssignment.findAll({
            where: {
                facultyId: req.params.id
            },
            order: [
                ['createdAt', 'DESC'],
                ['specialization', 'ASC']
            ]
        })
    ])

    if (!foundCollege) {
        console.log(`${foundFaculty.id} has no college association from Colleges table.`)
        req.flash('error', 'College Not Found!')
        res.redirect('/admin/faculties')
        return
    }

    const s = {}
    specializations.forEach(specialization => s[specialization.id] = specialization.name)

    const semestersHistory = {}
    const specializationsHistory = {}

    data1.forEach(d => {
        let date = d.createdAt.toISOString()
        if (!semestersHistory[date])
            semestersHistory[date] = [d.semester]
        else
            semestersHistory[date].push(d.semester)
    })

    data2.forEach(d => {
        let date = d.createdAt.toISOString()
        if (!specializationsHistory[date])
            specializationsHistory[date] = [s[d.specialization]]
        else
            specializationsHistory[date].push(s[d.specialization])
    })

    let lastLogin = await LoginReport.findOne({
        where: {
            user: req.params.id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    })

    if (lastLogin)
        lastLogin = lastLogin.createdAt

    res.render('admin/faculty', { User: req.user, faculty: foundFaculty, college: foundCollege, specializations, formatDate, formatDateMoment, semestersHistory, specializationsHistory, lastLogin })
})

module.exports = router