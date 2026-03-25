/** @param {string} message - Error message
 *  @param {number} [statusCode=404] - HTTP status code */
module.exports = (message, statusCode = 404) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    throw err;
};
