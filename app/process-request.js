/*

Using helpers.getImageUrls function to grab image urls form page and return the array of urls.
Modified by: Abdelmajid Abdellatif

*/

const getPage  = require('./get-page')

//Require helpers
const helpers = require('../helpers/helpers')

module.exports = processRequest

async function processRequest (req, res) {
  if (req.method === 'OPTIONS') {
    return res.end()
  }

  const startTime = new Date()
  const params = parseParams(req)
  const page = await getPage(params)

  return createResponse(page, params, res, startTime)
}

function parseParams (req) {
  const params = {
    requestMethod: req.method,
    ...req.query,
    ...req.params
  }
  params.requestMethod = parseRequestMethod(params.requestMethod)
  params.format = (params.format || 'json').toLowerCase()
  return params
}

function parseRequestMethod (method) {
  method = (method || '').toUpperCase()

  if (['HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return method
  }
  return 'GET'
}

function createResponse (page, params, res, startTime) {
  //if format is images return object with image (urls) array
  if (params.format === 'images'){
    res.set('Content-Type', 'application/json')
    const imageUrls = helpers.getImageUrls(page.contents)
    return res.send({'urls': imageUrls})
  }

  if (params.format === 'raw' && !(page.status || {}).error) {
    res.set('Content-Length', page.contentLength)
    res.set('Content-Type', page.contentType)
    return res.send(page.content)
  }

  if (params.charset) res.set('Content-Type', `application/json; charset=${params.charset}`)
  else res.set('Content-Type', 'application/json')

  if (page.status) page.status.response_time = (new Date() - startTime)
  else page.response_time = (new Date() - startTime)

  if (params.callback) return res.jsonp(page)
  return res.send(JSON.stringify(page))
}
