const fs = require('fs')
const path = require('path')

const getFileContent = fileName => {
  const promise = new Promise((resolve, reject) => {
    const fullFileName = path.resolve(__dirname, "files", fileName)
    fs.readFile(fullFileName, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(JSON.parse(data.toString()))
    })
  })
  return promise
}

getFileContent('a.json').then(aData => {
  console.log(aData);
  return getFileContent(aData.next)
}).then(bData => {
  console.log(bData);
  return getFileContent(bData.next)
}).then(cData => {
  console.log(cData);
})