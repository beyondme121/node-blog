const redis = require('redis')
const { REDIS_CONF } = require('../config/db')

const client = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)

client.on('error', err => {
  console.error(err)
})


module.exports = client;