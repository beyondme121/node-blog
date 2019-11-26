const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { set, get } = require('../db/redis')

const getCookieExpiresTime = () => {
  const d = new Date()
  console.log(d.getTime());
  d.setTime(d.getTime() + (100 * 1000))
  console.log(d.toGMTString());
  return d.toGMTString()
}

const handleUserRouter = (req, res) => {

  const method = req.method
  // 登录
  // if (method === 'POST' && req.path === '/api/user/login') {
  //   const { username, password } = req.body
  //   const result = login(username, password)
  //   return result.then(result => {
  //     if (result.username) {
  //       return new SuccessModel()
  //     } else {
  //       return new ErrorModel('登录失败')
  //     }
  //   })
  // }

  if (method === 'POST' && req.path === '/api/user/login') {
    // const { username, password } = req.query
    const { username, password } = req.body

    const result = login(username, password)
    return result.then(data => {
      if (data.username) {
        // res.setHeader('Set-Cookie', `username=${data.username}; path=/; httpOnly; expires=${getCookieExpiresTime()}`)
        req.session.username = data.username
        req.session.realname = data.realname
        set(req.sessionId, req.session)
        return new SuccessModel('登录成功')
      }
      return new ErrorModel('登录失败')
    })
  }

  // 登录验证测试
  if (method === 'GET' && req.path === '/api/user/login-test') {
    if (req.session.username) {
      return Promise.resolve(new SuccessModel({
        username: req.session.username
      }))
    }
    return Promise.resolve(new ErrorModel('未登录'))
  }

}
module.exports = handleUserRouter