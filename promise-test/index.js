// callback方式
const fs = require('fs')
const path = require('path')
const fullName = path.resolve(__dirname, "files", "a.json")
// 读取文件
fs.readFile(fullName, (err, data) => {
  if (err) {
    console.log(err);
    return
  }
  console.log(data.toString());
})

// callback方式的函数
const getFileContent = (fileName, callback) => {
  const fullFileName = path.resolve(__dirname, 'files', fileName)
  fs.readFile(fullFileName, (err, data) => {
    if (err) {
      console.log(err);
      return
    }
    callback(JSON.parse(data.toString()))
  })
}

getFileContent(fullName, (aData) => {
  console.log(aData);
  getFileContent(aData.next, bData => {
    console.log(bData);
    getFileContent(bData.next, cData => {
      console.log(cData);
    })
  })
})