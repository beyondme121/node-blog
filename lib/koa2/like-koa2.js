const http = require('http')

function compose(middlewaresList) {
  return function (ctx) {
    function dispatch(i) {
      const fn = middlewaresList[i]
      try {
        return Promise.resolve(
          fn(ctx, dispatch.bind(null, i + 1))
        )
      } catch (error) {
        return Promise.reject(error)
      }
    }
    return dispatch(0)
  }
}

class LikeKoa2 {
  constructor() {
    this.middlewaresList = []
  }

  use(fn) {
    this.middlewaresList.push(fn)
    return this
  }

  // 需要把req res变成ctx
  createContext(req, res) {
    const ctx = {
      req, res
    }
    return ctx
  }

  handleRequest(ctx, fn) {
    return fn(ctx)
  }
  // 实现
  callback() {
    const fn = compose(this.middlewaresList)
    return (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
  }


  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }

}

module.exports = LikeKoa2