/**
 * @param {Date} date - Input date
 *
 * Transforms Date object into YYYY-MM-DD format.
 *
 * @returns {String} string representation of date in YYYY-MM-DD format.
 */
module.exports = date => {
    const date2 = new Date(date)
    let d = date2.getDate()
    let m = date2.getMonth() + 1
    const y = date2.getFullYear()
    if (d < 10)
        d = '0' + d
    if (m < 10)
        m = '0' + m
    return y + '-' + m + '-' + d
}