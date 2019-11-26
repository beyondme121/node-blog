const express = require('express')
const router = express.Router()
const { login, register } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')


/**
 * 用户登录
 */
router.post('/login', (req, res, next) => {
  const { username, password } = req.body   // 因为使用了 app.use(express.json());这个中间件
  const result = login(username, password)
  return result.then(data => {
    if (data.username) {
      req.session.username = data.username
      req.session.realname = data.realname
      res.json(new SuccessModel('登录成功!!!!!!!'))
      return
    }
    res.json(new ErrorModel('登录失败'))
  })
})


/**
 * 用户注册, 中间件判断用户名是否存在 isExistUser
 */
router.post('/register', (req, res, next) => {
  // 从表单中获取用户名密码, controller中处理密码加密
  const result = register(req.body)
  return result.then(data => {
    // 根据controller新建用户返回的结果,插入数据的id,
    if (data.id > 0) {
      res.json(new SuccessModel(data))
      // 如果不return, 会继续执行下面的注册失败, 报Cannot set headers after they are sent to the client
      return
    }
    res.json(new ErrorModel('注册失败'))
  })
})


// 校验登录是否成功 接口测试, 然后是上面的 /login的测试
router.get('/login-test', (req, res, next) => {
  if (req.session.username) {
    res.json({
      errorno: 0,
      msg: '登录成功'
    })
    return
  }
  res.json({
    errorno: -1,
    msg: '未登录'
  })
})

// 当前用户刷新页面的次数
router.get('/session-visit', (req, res, next) => {
  const session = req.session
  if (session.viewNum == null) {
    session.viewNum = 0
  }
  session.viewNum++
  res.json({
    errorno: 0,
    data: {
      viewNum: session.viewNum
    }
  })
})

module.exports = router