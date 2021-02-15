require('dotenv').config()
const fs = require('fs')

require('./db')
const {
    // MySql
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
    UserRole,
    // Mongo
    ActivityLog,
    Dropzone,
    Quiz,
    QuizAssignmentResponse
} = require('./models')
const { sendMailPromise } = require('./util')

const main = async () => {
    const email = process.argv[2]
    const filename = `dump - ${Date.now()}.json`
    const data = {}
    // MySql
    data.AcademicCourseAssignedToStudent = await AcademicCourseAssignedToStudent.findAll()
    data.AcademicCourse = await AcademicCourse.findAll()
    data.Chapter = await Chapter.findAll()
    data.College = await College.findAll()
    data.CourseAssignedToCollege = await CourseAssignedToCollege.findAll()
    data.CourseAssignedToStudent = await CourseAssignedToStudent.findAll()
    data.CourseRevokedFromStudent = await CourseRevokedFromStudent.findAll()
    data.Course = await Course.findAll()
    data.FacultyHODAssignment = await FacultyHODAssignment.findAll()
    data.FacultySemesterAssignment = await FacultySemesterAssignment.findAll()
    data.FacultySpecializationAssignment = await FacultySpecializationAssignment.findAll()
    data.ForgotPassword = await ForgotPassword.findAll()
    data.Lesson = await Lesson.findAll()
    data.LoginReport = await LoginReport.findAll()
    data.QuizAssignment = await QuizAssignment.findAll()
    data.Specialization = await Specialization.findAll()
    data.StudentAcademicCourseChapterTracking = await StudentAcademicCourseChapterTracking.findAll()
    data.StudentAcademicCourseLessonTracking = await StudentAcademicCourseLessonTracking.findAll()
    data.StudentAcademicCourseLog = await StudentAcademicCourseLog.findAll()
    data.StudentCourseLog = await StudentCourseLog.findAll()
    data.StudentCourseTopicTracking = await StudentCourseTopicTracking.findAll()
    data.StudentCourseUnitTracking = await StudentCourseUnitTracking.findAll()
    data.Topic = await Topic.findAll()
    data.Unit = await Unit.findAll()
    data.User = await User.findAll()
    data.UserRole = await UserRole.findAll()
    // Mongo
    data.ActivityLog = await ActivityLog.find()
    data.Dropzone = await Dropzone.find()
    data.Quiz = await Quiz.find()
    data.QuizAssignmentResponse = await QuizAssignmentResponse.find()
    if (email) {
        await sendMailPromise(email, `IBM LMS DB Dump`, '', '', [{ filename, content: JSON.stringify(data) }])
        return `Exported ${filename} and sent to ${email}`
    }
    else {
        fs.writeFileSync(filename, JSON.stringify(data))
        return `Exported ${filename}`
    }
}

main()
    .then(message => {
        console.log(message)
        process.exit(0)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })