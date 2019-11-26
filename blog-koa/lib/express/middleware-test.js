const express = require('./my-express')
const app = express()

app.use(function (req, res, next) {
  console.log('请求开始', req.method, req.url);
  next()
})

app.use((req, res, next) => {
  console.log('处理cookie');
  req.cookie = {
    userId: 'sanfeng'
  }
  next()
})

// 处理异步请求
app.use((req, res, next) => {
  console.log('处理异步请求');
  setTimeout(() => {
    req.body = {
      a: 100,
      b: 200
    }
    next()
  })
})

// 处理某个路由,无论什么method

app.use('/api', (req, res, next) => {
  console.log('处理api下的所有路由');
  next()
})


// 处理某个路由开头, 处理get请求
app.get('/api', (req, res, next) => {
  console.log('get api 路由');
  next()
})

app.post('/api', (req, res, next) => {
  console.log('post api');
  next()
})

function loginCheck(req, res, next) {
  setTimeout(() => {
    console.log('模拟登陆成功')
    next()
  }, 0);
}

// 获取cookie 需要登录验证
app.use('/api/get-cookie', loginCheck, (req, res, next) => {
  console.log('get /api/get-cookie')
  res.json({
    error: 0,
    data: req.cookie
  })
})

// post数据
app.post('/api/get-post-data', function (req, res, next) {
  console.log('post /api/get-post-data');
  res.json({
    errorno: 0,
    data: req.body
  })
})

// 404

app.use(function (req, res, next) {
  console.log('处理 404')
  res.json({
    error: -1,
    msg: '404'
  })
})

app.listen(8082, () => {
  console.log('server start....');
})
