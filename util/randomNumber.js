/**
 * @param {number} length - The length of the Number to be Generated.
 *
 * Generates a Random Number of a given length.
 *
 * @returns {number} a randomly generated number.
 */
module.exports = length => {
    let text = ''
    let possible = '0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return parseInt(text)
}