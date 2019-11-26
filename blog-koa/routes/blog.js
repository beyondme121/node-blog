const router = require('koa-router')()

router.prefix('/api/blog')

router.get('/list', async (ctx, next) => {
  const query = ctx.query
  const method = ctx.method
  ctx.body = {
    errorno: 0,
    query,
    method
  }
})

module.exports = router