const crypto = require('crypto')
// 秘钥
const SECRET_KEY = 'HELLO_world123'

const md5 = (content) => {
  let md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex')  // 输出以16进制显示
}

function genPassword(password) {
  const str = `password=${password}&key=${SECRET_KEY}`
  return md5(str)
}

// let pwd = genPassword('123')
// console.log(pwd);


module.exports = {
  genPassword
}