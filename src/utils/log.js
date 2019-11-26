const fs = require('fs')
const path = require('path')

// 写日志
// 1. 生成writeStream
function createWriteStream(fileName) {
  const fullName = path.join(__dirname, '../', '../', 'log', fileName)
  return fs.createWriteStream(fullName, {
    flags: 'a'
  })
}

// 2. 写日志的通用方法
function writeLog(writeStream, logContent) {
  writeStream.write(logContent + '\n')
}

// 实际的业务
// 创建访问日志的写入流
const accessWriteStream = createWriteStream('access.log')
function access(logContent) {
  writeLog(accessWriteStream, logContent)
}



module.exports = {
  access
}