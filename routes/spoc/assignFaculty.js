const express = require('express')
const async = require('async')

const {
    User,
    FacultyHODAssignment,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    Specialization
} = require('../../models')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [faculties, allSpecializations, hods] = await async.parallel([
            async () => await User.findAll({
                where: {
                    role: 2,
                    college: req.user.college,
                    active: true
                }
            }),
            async () => await Specialization.findAll(),
            async () => await FacultyHODAssignment.findAll({ where: { collegeId: req.user.college } })
        ])
        const specializations = {}
        allSpecializations.forEach(s => {
            specializations[s.id] = s.name
        })
        faculties.forEach(faculty => {
            faculty.isHOD = false
            const h = hods.find(h => h.userId === faculty.id)
            if (h) {
                faculty.isHOD = true
                faculty.hodSpecializationId = h.specializationId
                faculty.hodSpecializationName = specializations[h.specializationId]
            }
        })
        res.render('spoc/assignFaculty', { User: req.user, faculties, specializations })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const hod = await FacultyHODAssignment.findOne({
            where: {
                userId: req.params.id,
                collegeId: req.user.college
            }
        })
        if (hod) {
            const [specializations, hods] = await async.parallel([
                async () => await Specialization.findAll(),
                async () => await FacultyHODAssignment.findAll({ where: { collegeId: req.user.college }, attributes: ['specializationId'] })
            ])
            hod.specializationName = specializations.find(s => s.id === hod.specializationId).name
            const s = []
            specializations.forEach(sp => {
                const found = hods.find(h => h.specializationId === sp.id)
                if (!found) {
                    s.push(sp)
                }
            })
            return res.json({ status: 200, data: { isHOD: true, hod, specializations: s } })
        }

        const [specializations, assignedSemesters, assignedSpecializations] = await async.parallel([
            async () => await Specialization.findAll(),
            async () => await FacultySemesterAssignment.findAll({
                where: {
                    facultyId: req.params.id,
                    active: true
                }
            }),
            async () => await FacultySpecializationAssignment.findAll({
                where: {
                    facultyId: req.params.id,
                    active: true
                }
            })
        ])
        const s = []
        specializations.forEach(specialization => {
            s.push({
                id: specialization.id,
                name: specialization.name,
                isAssigned: assignedSpecializations.find(s => s.specialization === specialization.id) ? true : false
            })
        })

        const semesters = [
            {
                value: 1,
                isAssigned: false
            },
            {
                value: 2,
                isAssigned: false
            },
            {
                value: 3,
                isAssigned: false
            },
            {
                value: 4,
                isAssigned: false
            },
            {
                value: 5,
                isAssigned: false
            },
            {
                value: 6,
                isAssigned: false
            },
            {
                value: 7,
                isAssigned: false
            },
            {
                value: 8,
                isAssigned: false
            }
        ]
        semesters.forEach(semester => {
            if (assignedSemesters.find(sem => sem.semester === semester.value))
                semester.isAssigned = true
        })

        res.json({ status: 200, data: { isHOD: false, semesters, specializations: s, facultyId: req.params.id } })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.post('/', async (req, res) => {
    const { facultyId, semesters, specializations } = req.body
    if (!facultyId)
        return res.status(400).json({ status: 400, message: 'Faculty Id is required!' })
    if (!(Array.isArray(semesters)))
        return res.status(400).json({ status: 400, message: 'Semesters Must be an Array!' })
    if (!(Array.isArray(specializations)))
        return res.status(400).json({ status: 400, message: 'Specializations Must be an Array!' })
    try {
        const found = await FacultyHODAssignment.findOne({
            where: {
                userId: facultyId
            }
        })

        if (found) return res.status(400).json({ status: 400, message: 'Cannot assign to HOD!' })

        await async.parallel([
            async () => await FacultySemesterAssignment.update({
                active: false
            }, {
                where: {
                    facultyId,
                    active: true
                }
            }),
            async () => await FacultySpecializationAssignment.update({
                active: false
            }, {
                where: {
                    facultyId,
                    active: true
                }
            })
        ])

        const date = new Date()

        if (semesters.length === 0 && specializations.length === 0)
            return res.status(400).json({ status: 400, message: 'Semesters and specializations are required' })

        if (semesters.length)
            await FacultySemesterAssignment.bulkCreate(semesters.map(s => ({
                facultyId,
                semester: s.value,
                createdAt: date
            })))

        if (specializations.length)
            await FacultySpecializationAssignment.bulkCreate(specializations.map(s => ({
                facultyId,
                specialization: s.id,
                createdAt: date
            })))

        res.json({ status: 200, message: 'Assigned Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.post('/hod', async (req, res) => {
    try {
        const { facultyId, specializationId } = req.body
        if (!facultyId) return res.status(400).json({ status: 400, message: 'facultyId is required!' })
        if (!specializationId) return res.status(400).json({ status: 400, message: 'specializationId is required!' })
        const found = await FacultyHODAssignment.findOne({
            where: {
                specializationId,
                collegeId: req.user.college
            }
        })

        if (found) return res.status(400).json({ status: 400, message: 'HOD already assigned on this specialization' })

        await async.parallel([
            async () => await FacultySemesterAssignment.update({
                active: false
            }, {
                where: {
                    facultyId,
                    active: true
                }
            }),
            async () => await FacultySpecializationAssignment.update({
                active: false
            }, {
                where: {
                    facultyId,
                    active: true
                }
            })
        ])

        await FacultyHODAssignment.create({
            userId: facultyId,
            specializationId,
            collegeId: req.user.college
        })
        res.status(201).json({ status: 201, facultyId, specializationId })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.delete('/hod/:id', async (req, res) => {
    try {
        await FacultyHODAssignment.destroy({
            where: {
                userId: req.params.id
            }
        })
        res.json({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router