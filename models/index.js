module.exports = {
    // MySql Models
    UserRole: require('./UserRoleModel'),
    User: require('./UserModel'),
    College: require('./CollegeModel'),
    Specialization: require('./SpecializationModel'),
    Course: require('./CourseModel'),
    Unit: require('./UnitModel'),
    Topic: require('./TopicModel'),
    LoginReport: require('./LoginReportModel'),
    CourseAssignedToCollege: require('./CourseAssignedToCollegeModel'),
    CourseAssignedToStudent: require('./CourseAssignedToStudentModel'),
    StudentCourseTopicTracking: require('./StudentCourseTopicTrackingModel'),
    StudentCourseUnitTracking: require('./StudentCourseUnitTrackingModel'),
    ForgotPassword: require('./ForgotPasswordModel'),
    FacultyHODAssignment: require('./FacultyHODAssignmentModel'),
    FacultySemesterAssignment: require('./FacultySemesterAssignmentModel'),
    FacultySpecializationAssignment: require('./FacultySpecializationAssignmentModel'),
    StudentCourseLog: require('./StudentCourseLogModel'),
    CourseRevokedFromStudent: require('./CourseRevokedFromStudentModel'),
    AcademicCourse: require('./AcademicCourseModel'),
    Chapter: require('./ChapterModel'),
    Lesson: require('./LessonModel'),
    AcademicCourseAssignedToStudent: require('./AcademicCourseAssignedToStudentModel'),
    StudentAcademicCourseChapterTracking: require('./StudentAcademicCourseChapterTrackingModel'),
    StudentAcademicCourseLessonTracking: require('./StudentAcademicCourseLessonTrackingModel'),
    StudentAcademicCourseLog: require('./StudentAcademicCourseLogModel'),
    QuizAssignment: require('./QuizAssignmentModel'),
    // Mongo Models
    ActivityLog: require('./ActivityLogModel'),
    Dropzone: require('./DropzoneModel'),
    Quiz: require('./QuizModel'),
    QuizAssignmentResponse: require('./QuizAssignmentResponseModel')
}