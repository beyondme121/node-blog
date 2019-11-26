const http = require('http')
const slice = Array.prototype.slice

class MyExpress {
  constructor() {
    this.routes = {
      all: [],
      get: [],
      post: []
    }
  }

  register(path) {
    let info = {}
    if (typeof path === 'string') {
      info.path = path
      info.stack = slice.call(arguments, 1)
    } else {
      info.path = '/'
      info.stack = slice.call(arguments, 0)
    }
    return info
  }

  use() {
    const info = this.register.apply(this, arguments)
    this.routes.all.push(info)
    console.log(this.routes.all);
  }

  get() {
    const info = this.register.apply(this, arguments)
    this.routes.get.push(info)
  }

  post() {
    const info = this.register.apply(this, arguments)
    this.routes.post.push(info)
  }

  match(url, method) {
    let stack = []
    // 从所有的中间件中, 筛选出匹配url，method的中间件
    if (url === '/favicon.ico') {
      return stack
    }
    // 将all,get,post中的中间件组合成一个数组(包含了use, 以及符合method条件的中间件)
    let curRoutes = []
    curRoutes = curRoutes.concat(this.routes.all)
    curRoutes = curRoutes.concat(this.routes[method])
    curRoutes.forEach(route => {
      if (url.indexOf(route.path) === 0) {
        stack = stack.concat(route.stack)
      }
    })
    return stack
  }

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
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify(data)
        )
      }
      let url = req.url
      let method = req.method.toLowerCase()
      // 获取匹配上的路由中间件
      const resultList = this.match(url, method)
      // 执行所有匹配的中间件数组中的middlewares
      this.handle(req, res, resultList)
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

module.exports = () => {
  return new MyExpress()
}