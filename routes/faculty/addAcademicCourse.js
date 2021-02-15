const { Router } = require('express')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { FacultySemesterAssignment, FacultySpecializationAssignment, Specialization, AcademicCourse, ActivityLog } = require('../../models')
const { random } = require('../../util')

const courseImageStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads/courseImages'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const imageFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const courseImageUpload = multer({
    storage: courseImageStorage,
    fileFilter: imageFilter
})

const router = Router()

router.get('/', async (req, res) => {
    try {
        let allSemesters, allSpecializations

        if (!req.user.isHOD) {
            const [assignedSemesters, assignedSpecializations, specializations] = await async.parallel([
                async () => await FacultySemesterAssignment.findAll({
                    where: {
                        facultyId: req.user.id,
                        active: true
                    }
                }),
                async () => await FacultySpecializationAssignment.findAll({
                    where: {
                        facultyId: req.user.id,
                        active: true
                    }
                }),
                async () => await Specialization.findAll()
            ])

            allSemesters = assignedSemesters.map(s => s.semester)
            allSpecializations = assignedSpecializations.map(s => {
                return {
                    id: s.specialization,
                    name: specializations.find(sp => sp.id === s.specialization).name
                }
            })
        } else {
            allSemesters = [1, 2, 3, 4, 5, 6, 7, 8]
            const spec = await Specialization.findOne({
                where: {
                    id: req.user.hodSpecializationId
                }
            })
            allSpecializations = [{ id: spec.id, name: spec.name }]
        }

        res.render('faculty/addAcademicCourse', { User: req.user, semesters: allSemesters, specializations: allSpecializations })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/', courseImageUpload.single('image'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/faculty/addAcademicCourse')
        return
    }
    const { name, description, semester, specializationId } = req.body
    if (!name) {
        if (req.file && req.file.filename)
            fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'name is required!')
        res.redirect('/faculty/addAcademicCourse')
        return
    }
    if (!description) {
        if (req.file && req.file.filename)
            fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'description is required!')
        res.redirect('/faculty/addAcademicCourse')
        return
    }
    if (!semester) {
        if (req.file && req.file.filename)
            fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'semester is required!')
        res.redirect('/faculty/addAcademicCourse')
        return
    }
    if (!specializationId) {
        if (req.file && req.file.filename)
            fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'specialization is required!')
        res.redirect('/faculty/addAcademicCourse')
        return
    }
    const obj = {
        name,
        description,
        semester,
        specializationId,
        creator: req.user.id,
        collegeId: req.user.college
    }

    if (req.file)
        obj.imageSource = req.file.filename
    try {
        const ac = await AcademicCourse.create(obj)

        await ActivityLog.create({
            id: ac.id,
            name: 'Academic Course',
            type: 'Create',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', 'Academic Course added successfully!')
        res.redirect('/faculty/academicCourses/' + ac.id)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (req.file && req.file.filename)
            fs.unlink(`uploads/courseImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router