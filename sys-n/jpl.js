// 88dc066ed05e312b0477100c434aff62

const https = require('https')

const res = https.request({
  pathname: 'horizons.cgi',
  host: 'ssd.jpl.nasa.gov',
  hash: '#results',
  method: 'POST',
  headers: {
    'Origin': 'https://ssd.jpl.nasa.gov',
    'Referer': 'https://ssd.jpl.nasa.gov/horizons.cgi',
    'Host': `ssd.jpl.nasa.gov`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Content-Type': `multipart/form-data; boundary=----WebKitFormBoundaryddnCr44E7aNuZLKz`,
    'Cookie': `_ga=GA1.2.1620875497.1610164134; _ce.s=v11.rlc~1610171339949; __utma=259910805.1620875497.1610164134.1613028039.1613028041.3; __utmz=259910805.1613028041.3.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not provided); CGISESSID=bcbaa5b990e39bdf2b8d4c2bb0a86821`,
    'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'sec-ch-ua': `" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"`,
    'sec-ch-ua-mobile': `?0`,
    'Upgrade-Insecure-Requests': '1'
  }
}, (res) => {
  res.setEncoding('ascii')
  res.on('data', (chunk) => {
    console.log(chunk)
  })
})


res.write(`
------WebKitFormBoundaryrgtAxnrfawgcOUz3
Content - Disposition: form - data; name = "go_x"

Generate Ephemeris
------WebKitFormBoundaryrgtAxnrfawgcOUz3--
`)
res.end()