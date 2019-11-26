const { exec, escape } = require('../db/mysql')
const xss = require('xss')

// 获取博客列表
const getList = (author, keyword) => {
  let sql = `select * from blogs where 1=1 `
  if (author) {
    author = escape(author)
    sql += `and author = ${author} `
  }
  if (keyword) {
    keyword = escape(keyword)
    sql += `and title like %${keyword}% `
  }
  sql += `order by createtime desc;`

  // 返回promise
  return exec(sql)
}

// 获取详情
const getDetail = id => {
  const sql = `select * from blogs where id = ${id}`
  return exec(sql).then(result => {
    return result[0]
  })
}

const newBlog = (data = {}) => {
  // 其中author是假数据
  let { title, content, author } = data
  const createtime = Date.now()
  title = escape(xss(title))
  content = escape(xss(content))
  author = escape(xss(author))

  const sql = `
    insert into blogs (title, content, createtime, author)
    values(${title}, ${content}, ${createtime}, ${author})
  `
  return exec(sql).then(insertData => {
    return {
      id: insertData.insertId
    }
  })
}

// 更新博客
const updateBlog = (id, blogData = {}) => {
  let { title, content } = blogData
  title = escape(xss(title))
  content = escape(xss(content))

  let sql = `update blogs set title=${title}, content=${content} where id=${id}`
  return exec(sql).then(updateData => {
    if (updateData.affectedRows > 0) {
      return true
    }
    return false
  })
}

const deleteBlog = (id, author) => {
  author = escape(xss(author))
  const sql = `delete from blogs 
    where id=${id} and author=${author}`

  return exec(sql).then(delData => {
    if (delData.affectedRows > 0) {
      return true
    }
    return false
  })
}

// 在router中使用controller
module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
}

