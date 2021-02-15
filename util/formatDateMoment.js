const moment = require('moment')

/**
 * @param {Date} date - The date to be formatted with moment.
 *
 * Format Date using moment js
 *
 * @returns {string} the corresponding string to given date.
 */
module.exports = date => moment(new Date(date)).utcOffset('+05:30').format('MMMM Do YYYY, h:mm:ss a')