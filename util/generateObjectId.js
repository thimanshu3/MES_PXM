const os = require('os')
const crypto = require('crypto')

/**
 * Generates a MongoDB-style ObjectId in Node.js.
 *
 * @returns {string} Id in same format as MongoDB ObjectId.
 */
module.exports = () => {
    const seconds = Math.floor(new Date() / 1000).toString(16)
    const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6)
    const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0')
    const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0')
    return seconds + machineId + processId + counter
}