const fs = require('fs')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 业务上增加的session和redis连接
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const blogRouter = require('./routes/blog')
const userRouter = require('./routes/user')

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
/**
 * 默认写法,
 * app.use(logger('dev', { stream: process.stdout }))
 */

/**
 * 日志处理 使用morgan, 判断环境变量
 */

const env = process.env.NODE_ENV
if (env != 'production') {
  app.use(logger('dev'))
} else {
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const ws = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    stream: ws
  }))
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));


const redisClient = require('./db/redis')   // 获取连接redis的client
const sessionStore = new RedisStore({
  client: redisClient
})

/**
 * 路由开始之前处理session, session用于鉴权等, 所有路由请求之前, 都向客户端种cookie
 * Name: connect.sid
 * Value: 加密的字符串s%3AU4vjRoltstwibBzNI7Vn5kxNNGWTJf43.cgnCBU%2BOEsFv41YvfDPC2IhgTNYn9Ww%2BMRCn0xqvRDM
 * secret秘钥发生变化, Value也会变化
 */

/**
 * 1. 向客户端种cookie: session:sid -> xxxxx
 * 2. 并且设置cookie的过期时间等相关信息, 如httpOnly, 不能由客户端修改或者获取服务器端设置给客户端的cookie
 * 3. cookie存储为redis
 */
app.use(session({
  secret: 'ROOTsanfeng123',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  store: sessionStore
}))


// 业务路由
app.use('/api/blog', blogRouter)
app.use('/api/user', userRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
