/**
 * @param {number} length - The length of the String to be Generated
 * 
 * Generates a Random String of a given length.
 * The generated String includes characters and numbers.
 *
 * @returns {string} a randomly generated string.
 */
module.exports = length => {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}