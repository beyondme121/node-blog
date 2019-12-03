const crypto = require('crypto')
const SECRETKEY = "HELLOworld"


const md5 = content => {
  const md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex')
}

const genPassword = password => {
  let str = `password=${password}&key=${SECRETKEY}`
  return md5(str)
}

module.exports = genPassword