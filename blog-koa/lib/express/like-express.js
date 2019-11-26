const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
  constructor() {
    // 存放中间件的列表
    this.routes = {
      all: [],    // 所有通过app.use注册的中间件
      get: [],    // 所有通过app.get注册的中间件
      post: [],    // 所有通过app.post注册的中间件
    }
  }

  // 注册一次中间件, 可能包含路由+中间件, 中间件, 路由+多个中间件
  register(path) {
    const info = {}
    if (typeof path === 'string') {
      info.path = path
      info.stack = slice.call(arguments, 1)
    } else {
      // 当没写路由时
      info.path = '/'
      info.stack = slice.call(arguments, 0)
    }
    return info
  }

  use() {
    const info = this.register.apply(this, arguments)
    this.routes.all.push(info)
  }

  get() {
    const info = this.register.apply(this, arguments)
    this.routes.get.push(info)
  }

  post() {
    const info = this.register.apply(this, arguments)
    this.routes.post.push(info)
  }

  // 中间件哪些需要访问,哪些不需要访问
  match(method, url) {
    let stack = []
    if (url === '/favicon.ico') {
      return stack
    }
    // 获取所有的routes, 中间件
    let curRoutes = []
    curRoutes = curRoutes.concat(this.routes.all)   // 收集所有使用use的中间件
    curRoutes = curRoutes.concat(this.routes[method])
    curRoutes.forEach(routeInfo => {
      // url === '/api/get-cookie' 且 routeInfo.path === '/'
      // url === '/api/get-cookie' 且 routeInfo.path === '/api'
      // url === '/api/get-cookie' 且 routeInfo.path === '/api/get-cookie'
      if (url.indexOf(routeInfo.path) === 0) {
        stack = stack.concat(routeInfo.stack)
      }
    })
    return stack
  }

  // 执行中间件的核心, 



  /**
   * 1. 定义从数组中获取第一个中间件并执行
   * @param {*} req 
   * @param {*} res 
   * @param {*} stack 
   */
  handle(req, res, stack) {
    const next = () => {
      const middleware = stack.shift()
      if (middleware) {
        middleware(req, res, next)
      }
    }
    next()
  }

  callback() {
    return (req, res) => {
      // 定义res.json函数
      res.json = data => {
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify(data)
        )
      }
      const url = req.url
      const method = req.method.toLowerCase()

      // 判断路由中间件是否匹配, 判断method和url是否匹配, 并返回匹配上的中间件列表
      const resultList = this.match(method, url)
      this.handle(req, res, resultList)
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

// 工程函数
module.exports = () => {
  return new LikeExpress()
}