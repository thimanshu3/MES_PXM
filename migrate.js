const fs = require('fs')
require('dotenv').config()

require('./db')
const { College, User } = require('./models')

const main = async () => {
    const originalCollege = {
        "collage_name": "Kaziranga University",
        "director_name": "Dr. Sajal Saha",
        "email": "sajalsaha@kazirangauniversity.in\r\n",
        "collage_url": "https://www.kazirangauniversity.in/"
    }
    const college = await College.create({
        name: originalCollege.collage_name,
        address: 'Koraikhowa, NH-37, Jorhat 785006, Assam, India',
        website: originalCollege.collage_url,
        directorName: originalCollege.director_name,
        directorEmail: originalCollege.email,
        directorContactNumber: 9127056383
    })
    const COLLEGE = college.id
    const CURRENT_YEAR = 2020
    const ROLES = {
        1: 3, //? Student
        3: 2, //? Faculty
        5: 1 //? SPoC
    }
    const SPECIALIZATIONS = {
        common_sub: 1, //? Cloud Computing
        None: 1, //? Cloud Computing
        'cloud computing': 1, //? Cloud Computing
        'data analysis': 2 //? Business Analytics'
    }
    const originalUsers = JSON.parse(fs.readFileSync('originalUsers.json'))
    await User.bulkCreate(originalUsers.map((user, index) => {
        const names = user.name.split(' ')
        const firstName = names[0]
        const lastName = names[names.length - 1]
        const obj = {
            email: user.email,
            password: '$2a$10$Ad8sqo3nSqDUoKC/n39.puBfd2ADMKJHbOaq73iFJySeCjb9Lieda',
            role: ROLES[user.role_id],
            contactNumber: index + 1,
            firstName,
            lastName,
            gender: user.gender === 'Male' ? 'male' : 'female',
            college: COLLEGE
        }
        if (obj.role === 2 || obj.role === 3) {
            obj.specialization = SPECIALIZATIONS[user.specialization]
        }
        if (obj.role === 3) {
            obj.semester = user.semester
            obj.enrollmentYear = CURRENT_YEAR - Math.ceil(obj.semester / 2)
        }
        return obj
    }))
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