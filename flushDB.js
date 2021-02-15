require('dotenv').config()

const { MySql } = require('./db')
const { ActivityLog, Dropzone, Quiz, QuizAssignmentResponse } = require('./models')

const main = async () => {
    // MySql
    await MySql.query('DROP TABLE IF EXISTS academicCourseAssignedToStudents')
    await MySql.query('DROP TABLE IF EXISTS academicCourses')
    await MySql.query('DROP TABLE IF EXISTS chapters')
    await MySql.query('DROP TABLE IF EXISTS colleges')
    await MySql.query('DROP TABLE IF EXISTS courseAssignedToColleges')
    await MySql.query('DROP TABLE IF EXISTS courseAssignedToStudents')
    await MySql.query('DROP TABLE IF EXISTS courseRevokedFromStudents')
    await MySql.query('DROP TABLE IF EXISTS courses')
    await MySql.query('DROP TABLE IF EXISTS facultyHODAssignments')
    await MySql.query('DROP TABLE IF EXISTS facultySemesterAssignments')
    await MySql.query('DROP TABLE IF EXISTS facultySpecializationAssignments')
    await MySql.query('DROP TABLE IF EXISTS forgotPasswords')
    await MySql.query('DROP TABLE IF EXISTS lessons')
    await MySql.query('DROP TABLE IF EXISTS loginReports')
    await MySql.query('DROP TABLE IF EXISTS quizAssignments')
    await MySql.query('DROP TABLE IF EXISTS specializations')
    await MySql.query('DROP TABLE IF EXISTS studentAcademicCourseChapterTrackings')
    await MySql.query('DROP TABLE IF EXISTS studentAcademicCourseLessonTrackings')
    await MySql.query('DROP TABLE IF EXISTS studentAcademicCourseLogs')
    await MySql.query('DROP TABLE IF EXISTS studentCourseLogs')
    await MySql.query('DROP TABLE IF EXISTS studentCourseTopicTrackings')
    await MySql.query('DROP TABLE IF EXISTS studentCourseUnitTrackings')
    await MySql.query('DROP TABLE IF EXISTS topics')
    await MySql.query('DROP TABLE IF EXISTS units')
    await MySql.query('DROP TABLE IF EXISTS userRoles')
    await MySql.query('DROP TABLE IF EXISTS users')
    // Mongo
    await ActivityLog.deleteMany({})
    await Dropzone.deleteMany({})
    await Quiz.deleteMany({})
    await QuizAssignmentResponse.deleteMany({})
}

main()
    .then(() => {
        console.log('Finished...')
        process.exit(0)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })