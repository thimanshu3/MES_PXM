/**
 * @param {Array} array - Input array
 * 
 * Checks Array elements to be all unique.
 *
 * @returns {boolean} true or false
 */
module.exports = array => {
    return array.length === new Set(array).size
}