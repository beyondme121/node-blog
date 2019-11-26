const mysql = require('mysql')
const { MYSQL_CONF } = require('../config/db')


const conn = mysql.createConnection(MYSQL_CONF)

// 开始连接

conn.connect()

// 传入sql, 执行, 返回promise
const exec = sql => {
  const promise = new Promise((resolve, reject) => {
    conn.query(sql, (err, data) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(data)
    })
  })
  return promise;
}

module.exports = {
  exec,
  escape: mysql.escape
}