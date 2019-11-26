const { exec, escape } = require('../db/mysql')
const xss = require('xss')
const { genPassword } = require('../utils/crypto')

const login = (username, password) => {
  username = escape(xss(username))

  // 先加密,后防止sql注入攻击
  password = genPassword(password)
  password = escape(password)
  const sql = `select username, realname from users 
    where username=${username} and pwd=${password}`;
  console.log("sql is ", sql);
  return exec(sql).then(rows => {
    return rows[0] || {}
  })
}

module.exports = {
  login
}