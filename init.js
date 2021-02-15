require('dotenv').config()

require('./db')
const {
    AcademicCourseAssignedToStudent,
    AcademicCourse,
    Chapter,
    College,
    CourseAssignedToCollege,
    CourseAssignedToStudent,
    CourseRevokedFromStudent,
    Course,
    FacultyHODAssignment,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    ForgotPassword,
    Lesson,
    LoginReport,
    QuizAssignment,
    Specialization,
    StudentAcademicCourseChapterTracking,
    StudentAcademicCourseLessonTracking,
    StudentAcademicCourseLog,
    StudentCourseLog,
    StudentCourseTopicTracking,
    StudentCourseUnitTracking,
    Topic,
    Unit,
    User,
    UserRole
} = require('./models')

const ENVIRONMENT_VARIABLES = [
    'NODE_ENV',
    'PORT',
    'SESSION_SECRET',
    'NODEMAILER_EMAIL',
    'NODEMAILER_PASSWORD',
    'GOOGLE_0AUTH_CLIENT_ID',
    'GOOGLE_0AUTH_CLIENT_SECRET',
    'PUPPETEER_URL'
]

const checkEnvironment = () => {
    const errors = []
    ENVIRONMENT_VARIABLES.forEach(envVar => {
        if (!process.env[envVar])
            errors.push(`${envVar} Not Set in .env File OR in Environment Variables!`)
    })
    if (errors.length) {
        errors.forEach(err => console.error(err))
        process.exit(1)
    }
}

checkEnvironment()

AcademicCourseAssignedToStudent
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'AcademicCourseAssignedToStudent Model Sync Complete!'))

AcademicCourse
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'AcademicCourse Model Sync Complete!'))

Chapter
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Chapter Model Sync Complete!'))

College
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'College Model Sync Complete!'))

Course
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Course Model Sync Complete'))

CourseAssignedToCollege
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'CourseAssignedToCollege Model Sync Complete'))

CourseAssignedToStudent
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'CourseAssignedToStudent Model Sync Complete'))

CourseRevokedFromStudent
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'CourseRevokedFromStudent Model Sync Complete'))

FacultyHODAssignment
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'FacultyHODAssignment Model Sync Complete'))

FacultySemesterAssignment
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'FacultySemesterAssignment Model Sync Complete'))

FacultySpecializationAssignment
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'FacultySpecializationAssignment Model Sync Complete'))

ForgotPassword
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'ForgotPassword Model Sync Complete'))

Lesson
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Lesson Model Sync Complete!'))

LoginReport
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'LoginReport Model Sync Complete'))

QuizAssignment
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'QuizAssignment Model Sync Complete'))

Specialization
    .sync()
    .then(() =>
        Specialization.bulkCreate([
            {
                id: 1,
                name: 'Cloud Computing'
            },
            {
                id: 2,
                name: 'Business Analytics'
            }
        ])
    )
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Specialization Model Sync Complete!'))
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Already Exists!')
            console.log('\x1b[32m%s\x1b[0m', 'Specialization Model Sync Complete!')
        }
        else {
            console.error(err)
            process.exit(1)
        }
    })

StudentAcademicCourseChapterTracking
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'StudentAcademicCourseChapterTracking Model Sync Complete!'))

StudentAcademicCourseLessonTracking
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'StudentAcademicCourseLessonTracking Model Sync Complete!'))

StudentAcademicCourseLog
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'StudentAcademicCourseLog Model Sync Complete!'))

StudentCourseLog
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'StudentCourseLog Model Sync Complete'))

StudentCourseTopicTracking
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'StudentCourseTopicTracking Model Sync Complete'))

StudentCourseUnitTracking
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'StudentCourseUnitTracking Model Sync Complete'))

Topic
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Topic Model Sync Complete'))

Unit
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Unit Model Sync Complete'))

User
    .sync()
    .then(() =>
        User.create({
            id: 'admin',
            email: 'aaditya@technonjr.org',
            password: '$2a$10$Ad8sqo3nSqDUoKC/n39.puBfd2ADMKJHbOaq73iFJySeCjb9Lieda',
            role: 0,
            contactNumber: 8696932715,
            firstName: 'Aaditya',
            lastName: 'Maheshwari',
            gender: 'male'
        }))
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'User Model Sync Complete!'))
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Already Exists!')
            console.log('\x1b[32m%s\x1b[0m', 'User Model Sync Complete!')
        }
        else {
            console.error(err)
            process.exit(1)
        }
    })

UserRole
    .sync()
    .then(() =>
        UserRole.bulkCreate([{
            id: 0,
            name: 'admin'
        },
        {
            id: 1,
            name: 'spoc'
        },
        {
            id: 2,
            name: 'faculty'
        },
        {
            id: 3,
            name: 'student'
        }]))
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'UserRole Model Sync Complete!'))
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Already Exists!')
            console.log('\x1b[32m%s\x1b[0m', 'UserRole Model Sync Complete!')
        }
        else {
            console.error(err)
            process.exit(1)
        }
    })