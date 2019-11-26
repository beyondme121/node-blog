const express = require('express')
const router = express.Router();
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
} = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middlewares/loginCheck')


// 列出所有博客
router.get('/list', function (req, res, next) {
  let author = req.query.author || ''
  let keyword = req.query.keyword || ''
  if (req.query.isadmin) {
    if (!req.session.username) {
      res.json(new ErrorModel('未登录'))
      return
    }
    // 强制查询自己的博客
    author = req.session.username
    console.log("author---,", author);

  }
  const result = getList(author, keyword)
  return result.then(data => {
    res.json(new SuccessModel(data))
  })
})


// 根据url传入id=1,查询id=1的博客明细
router.get('/detail', function (req, res, next) {
  // 查询明细 只能查询自己的博客
  const author = req.session.username || ''
  const result = getDetail(req.query.id, author)
  return result.then(data => {
    res.json(
      new SuccessModel(data)
    )
  })
})

/**
 * 新建博客, 需要验证是否已经登录
 */
router.post('/new', loginCheck, (req, res, next) => {
  req.body.author = req.session.username
  const result = newBlog(req.body)
  return result.then(data => {
    res.json(
      new SuccessModel(data)
    )
  })
})

// update
router.post('/update', loginCheck, (req, res, next) => {
  const result = updateBlog(req.query.id, req.body)
  result.then(value => {
    if (value) {
      res.json(
        new SuccessModel()
      )
      return
    } else {
      res.json(
        new ErrorModel('更新博客失败')
      )
    }
  })
})

// 删除
router.post('/del', loginCheck, (req, res, next) => {
  const author = req.session.username
  const result = deleteBlog(req.query.id, author)
  result.then(data => {
    if (data) {
      res.json(
        new SuccessModel()
      )
    } else {
      new ErrorModel('删除博客失败')
    }
  })
})


module.exports = router;
