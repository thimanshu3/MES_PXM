require('dotenv').config()
const readXlsxFile = require('read-excel-file/node')

require('./db')
const { Course, Unit, Topic } = require('./models')

const main = async () => {
    const mainSheetArray = []
    const rows = await readXlsxFile('uploads/ilors.xlsx')
    rows.shift()
    rows.forEach(row => {
        const obj = {}
        obj.specializationId = row[4]
        obj.iceCourseCode = row[5]
        obj.ilorCode = row[6]
        obj.name = row[1]
        obj.description = row[2]
        obj.semester = row[3]
        mainSheetArray.push(obj)
    })
    const coursesResult = await Course.bulkCreate(mainSheetArray)
    const promisesList = coursesResult.map(async course => {
        const rows = await readXlsxFile('uploads/ilors.xlsx', { sheet: course.ilorCode })
        let unitCount = 0
        rows.shift()
        const promiseList2 = rows.map(async row => {
            if (row[0].toString().toLowerCase().includes('unit')) {
                unitCount++
                return await Unit.create({
                    unitNumber: unitCount,
                    courseId: course.id
                })
            }
            else {
                return
            }
        })
        let units = await Promise.all(promiseList2)
        units = units.filter(unit => unit !== undefined)
        let unitCounter = -1
        rows.forEach(async row => {
            if (row[0].toString().toLowerCase().includes('unit')) {
                unitCounter++
            } else {
                await Topic.create({
                    serialNumber: row[0],
                    unitId: units[unitCounter].id,
                    name: row[2],
                    outcome: row[3],
                    duration: row[4],
                    objectResourceId: row[5],
                    originalId: row[1]
                })
            }
        })
    })
    await Promise.all(promisesList)
}

main()