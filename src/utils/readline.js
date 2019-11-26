const fs = require('fs')
const path = require('path')
const readline = require('readline')

const fileName = path.join(__dirname, '../../', 'log', 'access.log')
const readStream = fs.createReadStream(fileName)

// 创建rl对象
const rl = readline.Interface({
  input: readStream
})

let chromeSum = 0
let sum = 0

rl.on('line', data => {
  if (!data) {
    return
  }
  sum++
  const arr = data.split(' -- ')
  if (arr[2] && arr[2].indexOf('Chrome') > 0) {
    chromeSum++
  }
})

rl.on('close', () => {
  console.log('访问总数: ', sum, ", chrome总数: ", chromeSum);
})

