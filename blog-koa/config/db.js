const env = process.env.NODE_ENV

let MYSQL_CONF
let REDIS_CONF

if (env === 'dev') {
  MYSQL_CONF = {
    host: "127.0.0.1",
    user: "root",
    password: "123456",
    port: "3306",
    database: "blogs"
  }
  REDIS_CONF = {
    host: '127.0.0.1',
    port: 6379
  }
}
if (env === 'prd') {
  MYSQL_CONF = {
    host: "127.0.0.1",
    user: "root",
    password: "123456",
    port: "3306",
    database: "blogs"
  }
  REDIS_CONF = {
    host: '127.0.0.1',
    port: 6379
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
}