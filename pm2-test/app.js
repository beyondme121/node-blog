const http = require('http')
let count = 0
const server = http.createServer((req, res) => {
  console.log(req.url, ' -- ', req.method, ' -- ', req.url.indexOf('?') >= 0 ? req.url.split('?')[1].split('=')[1] : 'none');

  if (req.url === '/favicon.ico') {
    // console.log('再/favicon.ico中打印');
    return
  }
  console.log('正常日志记录在文件中');
  if (req.url === '/err') {
    throw new Error('假装出错了,也会记录在日志中')
  }
  res.end(
    JSON.stringify({
      username: 'sanfeng',
      age: count++
    })
  )
})

server.listen(8080, () => {
  console.log('server start at port 8080');
})