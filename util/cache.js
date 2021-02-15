const cache = {}

/**
 * @param {string} key - The key to retrieve corresponding value.
 *
 * Get the value stored in cache by key.
 *
 * @returns {string} the value corresponding to given key or null if not found.
 */
const get = key => {
    return cache[key] || null
}

/**
 * @param {string} key - The key to retrieve corresponding value.
 * @param {string} exp - The time (seconds) for the expiration of key value in cache.
 * @param {string} value - The value to be stored in cache.
 *
 * Add a key value pair in cache with an expiration.
 *
 * @returns {boolean} the status of operation.
 */
const set = (key, exp, value) => {
    const expiration = parseInt(exp) * 1000
    if (isNaN(expiration))
        return false
    cache[key] = value
    setTimeout(() => {
        remove(key)
    }, expiration)
    return true
}

/**
 * @param {string} key - The key to corresponding value to be removed.
 *
 * Remove the value stored in cache by key.
 *
 * @returns {boolean} the status of operation.
 */
const remove = key => {
    delete cache[key]
    return true
}

module.exports = {
    get,
    set,
    remove
}