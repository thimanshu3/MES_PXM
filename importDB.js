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

const main = async () => {
    const filename = process.argv[2]
    if (!filename) throw new Error('No file supplied!')
    if (filename.substr(filename.length - 5) !== '.json') throw new Error('Invalid file supplied! Expects a json file.')
    const data = JSON.parse(fs.readFileSync(filename))
    if (
        !data ||
        // MySql
        !data.AcademicCourseAssignedToStudent ||
        !data.AcademicCourse ||
        !data.Chapter ||
        !data.College ||
        !data.CourseAssignedToCollege ||
        !data.CourseAssignedToStudent ||
        !data.CourseRevokedFromStudent ||
        !data.Course ||
        !data.FacultyHODAssignment ||
        !data.FacultySemesterAssignment ||
        !data.FacultySpecializationAssignment ||
        !data.ForgotPassword ||
        !data.Lesson ||
        !data.LoginReport ||
        !data.QuizAssignment ||
        !data.Specialization ||
        !data.StudentAcademicCourseChapterTracking ||
        !data.StudentAcademicCourseLessonTracking ||
        !data.StudentAcademicCourseLog ||
        !data.StudentCourseLog ||
        !data.StudentCourseTopicTracking ||
        !data.StudentCourseUnitTracking ||
        !data.Topic ||
        !data.Unit ||
        !data.User ||
        !data.UserRole ||
        // Mongo
        !data.ActivityLog ||
        !data.Dropzone ||
        !data.Quiz ||
        !data.QuizAssignmentResponse
    ) throw new Error('Invalid Data!')
    if (
        !data ||
        // MySql
        !Array.isArray(data.AcademicCourseAssignedToStudent) ||
        !Array.isArray(data.AcademicCourse) ||
        !Array.isArray(data.Chapter) ||
        !Array.isArray(data.College) ||
        !Array.isArray(data.CourseAssignedToCollege) ||
        !Array.isArray(data.CourseAssignedToStudent) ||
        !Array.isArray(data.CourseRevokedFromStudent) ||
        !Array.isArray(data.Course) ||
        !Array.isArray(data.FacultyHODAssignment) ||
        !Array.isArray(data.FacultySemesterAssignment) ||
        !Array.isArray(data.FacultySpecializationAssignment) ||
        !Array.isArray(data.ForgotPassword) ||
        !Array.isArray(data.Lesson) ||
        !Array.isArray(data.LoginReport) ||
        !Array.isArray(data.QuizAssignment) ||
        !Array.isArray(data.Specialization) ||
        !Array.isArray(data.StudentAcademicCourseChapterTracking) ||
        !Array.isArray(data.StudentAcademicCourseLessonTracking) ||
        !Array.isArray(data.StudentAcademicCourseLog) ||
        !Array.isArray(data.StudentCourseLog) ||
        !Array.isArray(data.StudentCourseTopicTracking) ||
        !Array.isArray(data.StudentCourseUnitTracking) ||
        !Array.isArray(data.Topic) ||
        !Array.isArray(data.Unit) ||
        !Array.isArray(data.User) ||
        !Array.isArray(data.UserRole) ||
        // Mongo
        !Array.isArray(data.ActivityLog) ||
        !Array.isArray(data.Dropzone) ||
        !Array.isArray(data.Quiz) ||
        !Array.isArray(data.QuizAssignmentResponse)
    ) throw new Error('Invalid Data!')
    // MySql
    await AcademicCourseAssignedToStudent.sync({ force: true })
    await AcademicCourse.sync({ force: true })
    await Chapter.sync({ force: true })
    await College.sync({ force: true })
    await CourseAssignedToCollege.sync({ force: true })
    await CourseAssignedToStudent.sync({ force: true })
    await CourseRevokedFromStudent.sync({ force: true })
    await Course.sync({ force: true })
    await FacultyHODAssignment.sync({ force: true })
    await FacultySemesterAssignment.sync({ force: true })
    await FacultySpecializationAssignment.sync({ force: true })
    await ForgotPassword.sync({ force: true })
    await Lesson.sync({ force: true })
    await LoginReport.sync({ force: true })
    await QuizAssignment.sync({ force: true })
    await Specialization.sync({ force: true })
    await StudentAcademicCourseChapterTracking.sync({ force: true })
    await StudentAcademicCourseLessonTracking.sync({ force: true })
    await StudentAcademicCourseLog.sync({ force: true })
    await StudentCourseLog.sync({ force: true })
    await StudentCourseTopicTracking.sync({ force: true })
    await StudentCourseUnitTracking.sync({ force: true })
    await Topic.sync({ force: true })
    await Unit.sync({ force: true })
    await User.sync({ force: true })
    await UserRole.sync({ force: true })
    await AcademicCourseAssignedToStudent.bulkCreate(data.AcademicCourseAssignedToStudent)
    await AcademicCourse.bulkCreate(data.AcademicCourse)
    await Chapter.bulkCreate(data.Chapter)
    await College.bulkCreate(data.College)
    await CourseAssignedToCollege.bulkCreate(data.CourseAssignedToCollege)
    await CourseAssignedToStudent.bulkCreate(data.CourseAssignedToStudent)
    await CourseRevokedFromStudent.bulkCreate(data.CourseRevokedFromStudent)
    await Course.bulkCreate(data.Course)
    await FacultyHODAssignment.bulkCreate(data.FacultyHODAssignment)
    await FacultySemesterAssignment.bulkCreate(data.FacultySemesterAssignment)
    await FacultySpecializationAssignment.bulkCreate(data.FacultySpecializationAssignment)
    await ForgotPassword.bulkCreate(data.ForgotPassword)
    await Lesson.bulkCreate(data.Lesson)
    await LoginReport.bulkCreate(data.LoginReport)
    await QuizAssignment.bulkCreate(data.QuizAssignment)
    await Specialization.bulkCreate(data.Specialization)
    await StudentAcademicCourseChapterTracking.bulkCreate(data.StudentAcademicCourseChapterTracking)
    await StudentAcademicCourseLessonTracking.bulkCreate(data.StudentAcademicCourseLessonTracking)
    await StudentAcademicCourseLog.bulkCreate(data.StudentAcademicCourseLog)
    await StudentCourseLog.bulkCreate(data.StudentCourseLog)
    await StudentCourseTopicTracking.bulkCreate(data.StudentCourseTopicTracking)
    await StudentCourseUnitTracking.bulkCreate(data.StudentCourseUnitTracking)
    await Topic.bulkCreate(data.Topic)
    await Unit.bulkCreate(data.Unit)
    await User.bulkCreate(data.User)
    await UserRole.bulkCreate(data.UserRole)
    // Mongo
    await ActivityLog.deleteMany({})
    await Dropzone.deleteMany({})
    await Quiz.deleteMany({})
    await QuizAssignmentResponse.deleteMany({})
    await ActivityLog.insertMany(data.ActivityLog)
    await Dropzone.insertMany(data.Dropzone)
    await Quiz.insertMany(data.Quiz)
    await QuizAssignmentResponse.insertMany(data.QuizAssignmentResponse)
    return filename
}

main()
    .then(filename => {
        console.log(`Imported ${filename}`)
        process.exit(0)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })