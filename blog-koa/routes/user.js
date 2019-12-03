const router = require('koa-router')()
router.prefix('/api/user')
const { login, register } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  const data = await login(username, password)
  if (data.username) {
    // 设置session
    ctx.session.username = data.username
    ctx.session.realname = data.realname
    ctx.body = new SuccessModel()
    return
  }
  ctx.body = new ErrorModel('登录失败')
})


// 测试session
router.get('/session-test', async (ctx, next) => {
  console.log(ctx.session.viewCount);
  if (!ctx.session.viewCount) {
    ctx.session.viewCount = 0
  }
  // 只要是操作了session, 就会将session中的相关数据,保存在redis中
  // 通过redis-cli或者其他代码, 获取redis中的key值
  ctx.session.viewCount++
  ctx.body = {
    errorno: 0,
    viewCount: ctx.session.viewCount
  }
})

module.exports = router