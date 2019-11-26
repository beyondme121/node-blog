const redis = require('redis')
const { REDIS_CONF } = require('../config/db')

const client = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)

client.on('error', err => {
  console.error(err)
})

function set(key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  client.set(key, val, redis.print)
}

// get是异步的
function get(key) {
  const promise = new Promise((resolve, reject) => {
    client.get(key, (err, val) => {
      if (err) {
        reject(err)
        return
      }
      // 如果没有获取到值, 也要resolve(null)
      if (val == null) {
        resolve(null)
        return
      }

      // 此处的try只是为了兼容json的转化格式
      try {
        // 如果可以将json格式的字符串转化为JSON对象,就不会报错, 报错就直接返回val
        resolve(JSON.parse(val))
      } catch (error) {
        resolve(val)
      }
      // 因为redis是单例，所以此处是不能退出的
      // redis.quit()
    })
  })
  return promise
}

module.exports = {
  get,
  set
}