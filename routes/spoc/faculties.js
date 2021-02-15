const express = require('express')
const async = require('async')

const {
    College,
    User,
    Specialization,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    LoginReport,
    FacultyHODAssignment
} = require('../../models')
const { formatDate, formatDateMoment } = require('../../util')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [faculties, hods, specializations] = await async.parallel([
            async () => await User.findAll({
                where: {
                    role: 2,
                    college: req.user.college,
                    active: true
                }
            }),
            async () => await FacultyHODAssignment.findAll({
                where: {
                    collegeId: req.user.college
                }
            }),
            async () => await Specialization.findAll()
        ])
        const s = {}
        specializations.forEach(sp => s[sp.id] = sp.name)
        await async.forEachLimit(faculties, 3, async f => {
            const found = hods.find(h => h.userId === f.id)
            if (found) {
                f.isHOD = true
                f.hodSpecializationName = s[found.specializationId]
            } else {
                f.isHOD = false
                const semesters = await FacultySemesterAssignment.findAll({
                    where: {
                        facultyId: f.id,
                        active: true
                    }
                })
                f.assignedSemesters = semesters.map(s => s.semester)
            }
        })
        res.render('spoc/faculties', { User: req.user, faculties })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const foundFaculty = await User.findOne({
            where: {
                id: req.params.id,
                role: 2
            }
        })

        if (!foundFaculty) {
            req.flash('error', 'Faculty Not Found!')
            res.redirect('/spoc/faculties')
            return
        }

        if (!(foundFaculty.college === req.user.college)) {
            req.flash('error', 'Faculty does not belong to your College!')
            res.redirect('/spoc/faculties')
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
            res.redirect('/spoc/faculties')
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

        res.render('spoc/faculty', { User: req.user, faculty: foundFaculty, college: foundCollege, specializations, formatDate, formatDateMoment, semestersHistory, specializationsHistory, lastLogin })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router