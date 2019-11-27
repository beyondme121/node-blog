// 1. 收集middle
// 2. 

const http = require('http')

function compose(middlewares) {
  return function (ctx) {
    function dispatch(i) {
      const fn = middlewares[i]
      try {
        return Promise.resolve(
          fn(ctx, dispatch.bind(null, i + 1))
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}

class MyKoa {
  constructor() {
    this.middlewares = []
  }

  use(fn) {
    this.middlewares.push(fn)
    return this
  }

  createContext(req, res) {
    return {
      req,
      res
    }
  }

  handleRequest(ctx, fn) {
    return fn(ctx)
  }

  callback() {
    return (req, res) => {
      // 执行每一个中间件,之前要先组合中间件, 组合之前要先创建上下文,把req res组合起来
      const ctx = this.createContext(req, res)
      const fn = compose(this.middlewares)
      return this.handleRequest(ctx, fn)
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }

}

module.exports = MyKoa