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

// 用户注册
const register = (data = {}) => {
  let { username, password } = data
  const createtime = Date.now()
  username = escape(xss(username.trim()))
  password = genPassword(password.trim())
  password = escape(password)

  const sql = `
    insert into users(username, pwd, createtime) values(${username}, ${password}, ${createtime})
  `
  console.log("register sql: ", sql);
  // 执行新建用户, promise返回自定义的insertId, 可以返回任何rows对象中的属性
  /**
    rows:  OkPacket {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 3,
    serverStatus: 2,
    warningCount: 1,
    message: '',
    protocol41: true,
    changedRows: 0 }
   */
  return exec(sql).then(rows => {
    console.log("rows: ", rows);
    return {
      id: rows.insertId
    }
  })
}

module.exports = {
  login,
  register
} 