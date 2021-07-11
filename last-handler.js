const http = require('http')
/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const LAST_HANDLER = async (req, res, next) => {
  await next()
  res.end()
}

module.exports = {
  LAST_HANDLER
}