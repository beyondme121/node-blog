const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog } = require('../controller/blog')

const { SuccessModel, ErrorModel } = require('../model/resModel')

// 只有增删改需要进行判断登录状态, 查询可以不用判断

// 中间件, 检查是否已经登录, session中是否有username, 如果没有提示未登录
const loginCheck = req => {
  if (!req.session.username) {
    return new ErrorModel('未登录')
  }
  return undefined
}


const handleBlogRouter = (req, res) => {
  const method = req.method
  const id = req.query.id

  // 获取博客列表
  if (method === 'GET' && req.path === '/api/blog/list') {
    const author = req.query.author || ''
    const keyword = req.query.keyword || ''
    // const listData = getList(author, keyword)
    // 根据model 使用sucessModel...
    // return new SuccessModel(listData)
    const result = getList(author, keyword)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  // 获取博客详情
  if (method === 'GET' && req.path === '/api/blog/detail') {
    return getDetail(id).then(result => {
      return new SuccessModel(result)
    })
  }

  // 新建博客
  if (method === 'POST' && req.path === '/api/blog/new') {
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }
    req.body.author = req.session.username
    return newBlog(req.body).then(result => {
      return new SuccessModel(result)
    })
  }

  // 更新博客 根据id
  if (method === 'POST' && req.path === '/api/blog/update') {
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }
    return updateBlog(id, req.body).then(result => {
      if (result) {
        return new SuccessModel()
      } else {
        return new ErrorModel('更新博客失败')
      }
    })
  }

  // 删除博客 根据id和博客作者
  if (method === 'POST' && req.path === '/api/blog/delete') {

    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }

    const author = req.session.username
    req.body.author = author
    const result = deleteBlog(id, author)
    return result.then(value => {
      if (value) {
        return new SuccessModel()
      } else {
        return new ErrorModel('删除博客失败')
      }
    })
  }
}

module.exports = handleBlogRouter