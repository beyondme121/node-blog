/**
 * 登录验证中间件, 用于判断session中是否有username, 如果有就认为已经登录
 */


const { ErrorModel } = require('../model/resModel')

module.exports = (req, res, next) => {
  if (req.session.username) {
    next()
    return
  }
  res.json(new ErrorModel('未登录'))
}