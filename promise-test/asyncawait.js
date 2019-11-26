const fs = require('fs')
const path = require('path')

const getFileContent = fileName => {
  const fullFileName = path.join(__dirname, 'files', fileName)
  const promise = new Promise((resolve, reject) => {
    fs.readFile(fullFileName, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(JSON.parse(data))
    })
  })
  return promise;
}

async function readFileData(fileName) {
  const aData = await getFileContent(fileName)
  console.log(aData);
  const bData = await getFileContent(aData.next)
  console.log(bData);
  const cData = await getFileContent(bData.next)
  console.log(cData);
}

readFileData('a.json')