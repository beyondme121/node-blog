const router = require('koa-router')()
router.prefix('/api/blog')

const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
} = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middlewares/loginCheck')

router.get('/list', async (ctx, next) => {
  let author = ctx.query.author || ''
  let keyword = ctx.query.keyword || ''
  let isadmin = ctx.query.isadmin

  if (isadmin) {
    if (!ctx.session.username) {
      ctx.body = new ErrorModel('未登录')
      return
    }
    // 强制查询自己的博客
    author = ctx.session.username
  }

  const listData = await getList(author, keyword)
  ctx.body = new SuccessModel(listData)
})

// 根据id查询博客的详情,但是要通过sql的筛选,必须是自己的博客
// 根据url传入id=1,查询id=1的博客明细
router.get('/detail', async (ctx, next) => {
  const author = ctx.session.username
  const result = await getDetail(ctx.query.id, author)
  ctx.body = new SuccessModel(result)
})

/**
 * 新建博客, 需要验证是否已经登录
 */
router.post('/new', loginCheck, async (ctx, next) => {
  // post提交的数据
  const body = ctx.request.body
  body.author = ctx.session.username
  const data = await newBlog(req.body)
  ctx.body = new SuccessModel(data)
})

/**
 * 更新博客
 */

router.post('/update', loginCheck, async (ctx, next) => {
  const val = await updateBlog(ctx.query.id, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel(val)
  } else {
    ctx.body = new ErrorModel('更新博客失败')
  }
})

router.post('/delete', loginCheck, async (ctx, next) => {
  const author = ctx.session.username
  const val = await deleteBlog(ctx.query.id, author)
  if (val) {
    ctx.body = new SuccessModel(result)
  } else {
    ctx.body = new ErrorModel('删除博客失败')
  }
})

module.exports = router