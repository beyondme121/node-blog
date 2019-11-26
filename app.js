const querystring = require('querystring')
const { access } = require('./src/utils/log')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const { set, get } = require('./src/db/redis')


// 获取cookie的过期时间
const getExpiresTime = () => {
  let d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  return d.toGMTString()
}

const getPostData = (req) => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }
    let postData = ""
    req.on('data', chunk => {
      postData += chunk
    })
    req.on('end', () => {
      if (!postData) {
        resolve({})
        return
      }
      resolve(JSON.parse(postData))
    })
  })
  return promise
}

const serverHandle = (req, res) => {
  // 日志记录
  // access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)
  access(`${Date.now()}--${req.method}--${req.url}--${req.headers['user-agent']}`)

  // 设置返回格式
  res.setHeader('Content-Type', 'application/json')

  // 获取path
  const url = req.url
  req.path = url.split('?')[0]

  // 解析 query
  req.query = querystring.parse(url.split('?')[1])

  // 解析cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || ''
  cookieStr.split(';').forEach(item => {
    if (!item) {
      return
    }
    const arr = item.split('=')
    let key = arr[0]
    let val = arr[1]
    if (key) key = key.trim()
    if (val) val = val.trim()
    req.cookie[key] = val
  })
  // 设置redis的session信息 解析session
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    neddSetCooie = true
    userId = `${Date.now()}_${Math.random()}`
    // 在redis设置
    set(userId, {})
  }
  req.sessionId = userId
  // 从redis中获取session数据
  get(req.sessionId).then(sessionData => {
    if (!sessionData) {
      set(req.sessionId, {})
      req.session = {}
    } else {
      req.session = sessionData
    }
    return getPostData(req)
  }).then(postData => {
    req.body = postData
    const blogData = handleBlogRouter(req, res)
    if (blogData) {
      blogData.then(data => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getExpiresTime()}`)
        }
        res.end(JSON.stringify(data))
      })
      return
    }

    const userData = handleUserRouter(req, res)
    if (userData) {
      userData.then(data => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userid}; path=/; httpOnly; expires=${getExpiresTime()}`)
        }
        res.end(JSON.stringify(data))
      })
      return
    }
    // 未命中路由 返回404
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.write("404 NOT FOUND\n")
    res.end()
  })

  // 解析session
  // let needSetCookie = false
  // let userId = req.cookie.userid
  // if (!userId) {
  //   needSetCookie = true
  //   userId = `${Date.now()}_${Math.random()}`
  //   set(userId, {})
  // }

  // req.sessionId = userId
  // get(req.sessionId).then(sessionData => {
  //   if (sessionData == null) {
  //     set(req.sessionId, {})
  //     req.session = {}
  //   } else {
  //     req.session = sessionData
  //   }
  //   return getPostData(req)
  // })
  //   .then(postData => {
  //     req.body = postData
  //     // 处理 blog 路由
  //     const blogData = handleBlogRouter(req, res)
  //     if (blogData) {
  //       blogData.then(data => {
  //         if (needSetCookie) {
  //           res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getExpiresTime()}`)
  //         }
  //         res.end(JSON.stringify(data))
  //       })
  //       // 必须加上return,否则前端无法接收到响应
  //       return
  //     }

  //     // 处理 user 路由，userData是promise
  //     const userData = handleUserRouter(req, res)
  //     if (userData) {
  //       userData.then(userData => {
  //         if (needSetCookie) {
  //           res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getExpiresTime()}`)
  //         }
  //         res.end(JSON.stringify(userData))
  //       })
  //       return
  //     }


}

module.exports = serverHandle