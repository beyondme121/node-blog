// 使用stream 复制文件

const fs = require('fs')
const path = require('path')

const fileName = path.resolve(__dirname, 'test.txt')
const fileNameBK = path.resolve(__dirname, 'testbk.txt')
const readStream = fs.createReadStream(fileName)
const writeStream = fs.createWriteStream(fileNameBK)

let count = 0
// readStream.pipe(writeStream)
readStream.on('data', chunk => {
  // console.log(chunk.toString());
  count++
})

readStream.on('end', () => {
  console.log('copy end ...');
  console.log("count: ", count);
})


