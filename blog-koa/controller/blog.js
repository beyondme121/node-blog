const { exec, escape } = require('../db/mysql')
const xss = require('xss')


// 获取博客列表
const getList = async (author, keyword) => {
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
  return await exec(sql)
}

// 获取详情
const getDetail = async (id, author) => {
  let sql = `select * from blogs where 1=1 `
  if (id) {
    sql += `and id = ${id} `
  }
  if (author) {
    author = escape(xss(author))
    sql += `and author=${author}`
  }
  console.log("getDetail sql: ", sql);
  const rows = await exec(sql)
  return rows[0]
}

const newBlog = async (data = {}) => {
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
  console.log('new blog sql: ', sql);
  const insertData = await exec(sql)
  return {
    id: insertData.insertId
  }
}

// 更新博客
const updateBlog = async (id, blogData = {}) => {
  let { title, content } = blogData
  title = escape(xss(title))
  content = escape(xss(content))

  let sql = `update blogs set title=${title}, content=${content} where id=${id}`

  console.log('update blog sql: ', sql);
  const updateData = await exec(sql)
  if (updateData.affectedRows > 0) {
    return true
  } else {
    return false
  }
}

const deleteBlog = async (id, author) => {
  author = escape(xss(author))
  const sql = `delete from blogs 
    where id=${id} and author=${author}`
  console.log('delete blog sql: ', sql);
  const delData = await exec(sql)
  if (delData.affectedRows > 0) {
    return true
  } else {
    return false
  }
}

// 在router中使用controller
module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
}

