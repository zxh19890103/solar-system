// 88dc066ed05e312b0477100c434aff62

const https = require('https')

https.request('https://ssd.jpl.nasa.gov/horizons.cgi#results', {
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=----WebKitFormBoundaryddnCr44E7aNuZLKz`,
    'Cookie': `CGISESSID=bcbaa5b990e39bdf2b8d4c2bb0a86821`
  }
}, (res) => {
  res.setEncoding('ascii')
  res.on('data', (chunk) => {
    console.log(chunk)
  })
}).write(`
------WebKitFormBoundaryddnCr44E7aNuZLKz
Content-Disposition: form-data; name="go_x"

Generate Ephemeris
------WebKitFormBoundaryddnCr44E7aNuZLKz--
`)