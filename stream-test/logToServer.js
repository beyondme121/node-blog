const fs = require('fs')
const http = require('http')
const path = require('path')

const fileName = path.resolve(__dirname, 'test.txt')

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const rs = fs.createReadStream(fileName)
    rs.pipe(res)
  }
})

server.listen(8000, () => {
  console.log('server start 8000...');
})