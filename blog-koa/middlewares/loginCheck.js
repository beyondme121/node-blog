// 登录验证中间件, 用于判断session中是否有username, 如果有就认为已经登录

const { ErrorModel } = require('../model/resModel')

module.exports = async (ctx, next) => {
  if (ctx.session.username) {
    await next()
    return
  }
  ctx.body = new ErrorModel('未登录')
}