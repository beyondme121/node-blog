```js
const http = require("http");
const qs = require("querystring");

const server = http.createServer((req, res) => {
  console.log("method: ", req.method);
  const url = req.url;
  console.log("url: ", url);
  req.query = qs.parse(url.split("?")[1]);
  console.log("query: ", req.query);
  res.end(JSON.stringify(req.query));
});

server.listen(3000, () => {
  console.log("server start");
});
```

nodejs 处理 post 请求

```js
const http = require("http");
const qs = require("querystring");

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    console.log("content-type", req.headers["content-type"]);
    let postdata = "";
    req.on("data", chunk => {
      postdata += chunk;
    });
    req.on("end", () => {
      res.end(postdata.toString());
    });
  }
});

server.listen(3000, () => {
  console.log("server start");
});
```

综合实例

localhost:3000/api/blog?name=sanfeng

```json
{
  "method": "GET",
  "url": "/api/blog?name=sanfeng",
  "path": "/api/blog",
  "query": {
    "name": "sanfeng"
  }
}
```

```js
const http = require("http");
const qs = require("querystring");

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;
  const path = url.split("?")[0];
  const query = qs.parse(url.split("?")[1]);
  // 设置返回格式为 JSON, 这里返回的是返回值的类型, 即使返回的是字符串, 说明的也是字符串的类型是JSON格式
  res.setHeader("Content-Type", "application/json");
  const resData = {
    method,
    url,
    path,
    query
  };
  // 返回
  if (method === "GET") {
    res.end(JSON.stringify(resData));
  }
  if (method === "POST") {
    let postData = "";
    req.on("data", chunk => {
      postData += chunk;
    });
    req.on("end", () => {
      resData.postData = postData.toString();
      res.end(JSON.stringify(resData));
    });
  }
});

server.listen(3000, () => {
  console.log("server start");
});
```

### 搭建项目环境

- bin/www.js

```js
const http = require("http");
const serverHandle = require("../app");
const PORT = 3000;

const server = http.createServer(serverHandle);
server.listen(PORT);
```

- app.js

```js
const serverHandle = (req, res) => {
  // 设置返回格式
  res.setHeader("Content-Type", "application/json");
  const resData = {
    name: "sanfeng",
    env: process.env.NODE_ENV
  };
  res.end(JSON.stringify(resData));
};

module.exports = serverHandle;
```

- package.json

> 使用了 cross-env, 以及 nodemon, 生产环境使用 pm2, 不能使用 nodemon 了? 为什么?

```js
{
  "name": "koa-project",
  "version": "1.0.0",
  "description": "",
  "main": "bin/www.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=dev nodemon ./bin/www.js",
    "prd": "cross-env NODE_ENV=production pm2 ./bin/www.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "cross-env": "^6.0.3"
  }
}
```

为什么要分离 www.js 和 app.js，www 和 server 的技术有关,app 和业务有关, 不同的功能和场景进行分离开

### 初始化路由

第一步工作，把所有路由调通, 返回假数据

> 博客路由

```js
const handleBlogRouter = (req, res) => {
  const method = req.method;

  if (method === "GET" && req.path === "/api/blog/list") {
    return {
      msg: "获取博客列表的接口"
    };
  }
  if (method === "GET" && req.path === "/api/blog/detail") {
    return {
      msg: "博客详情接口"
    };
  }
  if (method === "POST" && req.path === "/api/blog/new") {
    return {
      msg: "新建博客"
    };
  }
  if (method === "POST" && req.path === "/api/blog/update") {
    return {
      msg: "update博客"
    };
  }
  if (method === "POST" && req.path === "/api/blog/delete") {
    return {
      msg: "删除博客"
    };
  }
};

module.exports = handleBlogRouter;
```

> 用户路由

```js
const handleUserRouter = (req, res) => {
  const method = req.method;
  // 登录
  if (method === "POST" && req.path === "/api/user/login") {
    return {
      msg: "登录接口"
    };
  }
};
module.exports = handleUserRouter;
```

> app.js

```js
const querystring = require("querystring");
const handleBlogRouter = require("./src/router/blog");
const handleUserRouter = require("./src/router/user");

const serverHandle = (req, res) => {
  // 设置返回格式
  res.setHeader("Content-Type", "application/json");
  const url = req.url;
  req.path = url.split("?")[0];
  req.query = querystring.parse(url.split("?")[1]);

  const blogData = handleBlogRouter(req, res);
  if (blogData) {
    res.end(JSON.stringify(blogData));
    return;
  }
  const userData = handleUserRouter(req, res);
  if (userData) {
    res.end(JSON.stringify(userData));
    return;
  }
  // 未命中路由 返回404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.write("404 NOT FOUND\n");
  res.end();
};

module.exports = serverHandle;
```

### 创建数据模型

> 以上的返回数据都是傻白甜的方式 return {msg: "dxxxx"}

```js
class BaseModel {
  constructor(data, message) {
    if (typeof data === "string") {
      this.message = data;
      data = null;
      message = null;
    }
    if (data) {
      this.data = data;
    }
    if (message) {
      this.message = message;
    }
  }
}

class SuccessModel extends BaseModel {
  constructor(data, message) {
    super(data, message);
    this.error = 0;
  }
}

class ErrorModel extends BaseModel {
  constructor(data, message) {
    super(data, message);
    this.error = -1;
  }
}

module.exports = {
  SuccessModel,
  ErrorModel
};
```

### 接口设计

#### 1. 获取博客列表

router/blog.js: **只关心路由匹配以及数据返回**

```js
// 获取博客列表
if (method === "GET" && req.path === "/api/blog/list") {
  const author = req.query.author || "";
  const keyword = req.query.keyword || "";
  const listData = getList(author, keyword);
  // 根据model 使用sucessModel...
  return new SuccessModel(listData);
}
```

controller/blog.js: 只关心接收到参数, 进行请求数据以及处理数据, 返回给调用 controller 的 router 路由

```js
const getList = (author, keyword) => {
  // 先返回假数据 格式是正确的, 没有对接DB,createtime 通过Date.now()
  return [
    {
      id: 1,
      title: "标题A",
      content: "内容A",
      createtime: 1574091944166,
      author: "sanfeng"
    },
    {
      id: 2,
      title: "标题B",
      content: "内容B",
      createtime: 1574091977939,
      author: "lisi"
    }
  ];
};

// 在router中使用controller
module.exports = {
  getList,
  getDetail
};
```

测试

http://localhost:3000/api/blog/list

返回结果

```json
{
  "data": [
    {
      "id": 1,
      "title": "标题A",
      "content": "内容A",
      "createtime": 1574091944166,
      "author": "sanfeng"
    },
    {
      "id": 2,
      "title": "标题B",
      "content": "内容B",
      "createtime": 1574091977939,
      "author": "lisi"
    }
  ],
  "error": 0
}
```

#### 2. 获取博客详情

router/blog.js

```js
const { SuccessModel, ErrorModel } = require("../model/resModel");
const { getDetail } = require("../controller/blog");
// ...
if (method === "POST" && req.path === "/api/blog/detail") {
  const id = req.query.id;
  const data = getDetail(id);
  return new SuccessModel(data);
}
```

controller/blog

```js
const getDetail = id => {
  return {
    id: 1,
    title: "标题A",
    content: "内容A",
    createtime: 1574091944166,
    author: "sanfeng"
  };
};
```

测试

http://localhost:3000/api/blog/detail?id=3

结果

#### 3. post 提交数据

因为是异步的, 封装一个 promise

```js
// callback方式
const fs = require("fs");
const path = require("path");
const fullName = path.resolve(__dirname, "files", "a.json");
// 读取文件
fs.readFile(fullName, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data.toString());
});

// callback方式的函数
const getFileContent = (fileName, callback) => {
  const fullFileName = path.resolve(__dirname, "files", fileName);
  fs.readFile(fullFileName, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    callback(JSON.parse(data.toString()));
  });
};

getFileContent(fullName, aData => {
  console.log(aData);
  getFileContent(aData.next, bData => {
    console.log(bData);
    getFileContent(bData.next, cData => {
      console.log(cData);
    });
  });
});
```

##### callback 写法

```js
const getFileContent = (fileName, callback) => {
  const fullFileName = path.resolve(__dirname, "files", fileName);
  fs.readFile(fullFileName, (err, data) => {
    if (err) return;
    callback(JSON.parse(data.toString()));
  });
};
// 调用 cb地狱
getFileContent("a.json", aData => {
  console.log(aData);
  getFileContent(aData.next, bData => {
    console.log(bData);
    getFileContent(bData.next, cData => {
      console.log(cData);
    });
  });
});
```

##### promise 写法

```js
const fs = require("fs");
const path = require("path");

const getFileContent = fileName => {
  const promise = new Promise((resolve, reject) => {
    const fullFileName = path.resolve(__dirname, "files", fileName);
    fs.readFile(fullFileName, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data.toString()));
    });
  });
  return promise;
};

getFileContent("a.json")
  .then(aData => {
    console.log(aData);
    return getFileContent(aData.next);
  })
  .then(bData => {
    console.log(bData);
    return getFileContent(bData.next);
  })
  .then(cData => {
    console.log(cData);
  });
```

##### async await 方式

##### 处理 post data 封装函数

promise 方式， app.js

```js
const getPostData = req => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== "POST") {
      resolve({});
      return;
    }
    if (req.headers["content-type"] !== "application/json") {
      resolve({});
      return;
    }
    let postData = "";
    req.on("data", chunk => {
      postData += chunk;
    });
    req.on("end", () => {
      if (!postData) {
        resolve({});
        return;
      }
      resolve(JSON.parse(postData));
    });
  });
  return promise;
};
```

```js
const serverHandle = (req, res) => {
  // 设置返回格式
  res.setHeader("Content-Type", "application/json");

  // 获取path
  const url = req.url;
  req.path = url.split("?")[0];

  // 解析 query
  req.query = querystring.parse(url.split("?")[1]);

  // 处理post data
  getPostData(req).then(postData => {
    req.body = postData;
    console.log(req.body);
    // 处理 blog 路由
    const blogData = handleBlogRouter(req, res);
    if (blogData) {
      res.end(JSON.stringify(blogData));
      return;
    }

    // 处理 user 路由
    const userData = handleUserRouter(req, res);
    if (userData) {
      res.end(JSON.stringify(userData));
      return;
    }

    // 未命中路由 返回404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("404 NOT FOUND\n");
    res.end();
  });
};
```

#### 4. 新建博客

router -> controller

```js
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
} = require("../controller/blog");

// 新建博客
if (method === "POST" && req.path === "/api/blog/new") {
  const blogData = req.body; // 已经通过promise处理了post data的数据
  const data = newBlog(blogData);
  return new SuccessModel(data);
}
```

```js
const newBlog = (data = {}) => {
  // data 是一个博客对象 包含 title content
  return {
    id: 3 // 表示新建博客, 插入DB的id
  };
};
```

#### 5. 更新博客

```js
// 更新博客 根据id
if (method === "POST" && req.path === "/api/blog/update") {
  const result = updateBlog(id, req.body);
  if (result) {
    return new SuccessModel(req.body);
  } else {
    return new ErrorModel("更新博客失败");
  }
}
```

> controller.js , 返回假数据, 更新成功

```js
const updateBlog = (id, blogData = {}) => {
  console.log("update blog", id, blogData);
  return true;
};
```

#### 6. 删除博客

```js
// 删除博客
if (method === "POST" && req.path === "/api/blog/delete") {
  const result = deleteBlog(id);
  if (result) {
    return new SuccessModel(req.body);
  } else {
    return new ErrorModel("删除博客失败");
  }
}
```

```js
const deleteBlog = id => {
  return true;
};
```

#### 7. 用户登录

假数据 router/user.js, 只关注 method 和 path

```js
const { loginCheck } = require("../controller/user");
const { SuccessModel, ErrorModel } = require("../model/resModel");
const handleUserRouter = (req, res) => {
  const method = req.method;
  // 登录
  if (method === "POST" && req.path === "/api/user/login") {
    const { username, password } = req.body;
    const result = loginCheck(username, password);
    if (result) {
      return new SuccessModel();
    }
    return new ErrorModel("登录失败");
  }
};
module.exports = handleUserRouter;
```

> controller/user.js, 判断用户名密码

```js
const loginCheck = (username, password) => {
  // 先使用假数据
  if (username === "sanfeng" && password === "123") {
    return true;
  }
  return false;
};

module.exports = {
  loginCheck
};
```

#### 8. 总结

1. nodejs 处理 http 请求常用技能(method, url, query, postdata, req.headers, content-type, res.setHeader)

2. postman 使用

3. nodejs 接口(未连接 DB,未使用登录) 但是接口调通

4. 为何要讲 router 和 controller 分开?

   router 处理路由相关，controller 处理数据

#### 9. 路由和 API

API: 前端与后端，不同子系统之间对接的一个术语

url(路由): `/api/blog/list` get, 输入，输出

路由: API 的一部分 后端系统内部的一个模块定义，后端去实现

### 连接数据库 MySQL

- workbench 官方可视化开发工具

### sql 注入

- mysql 中的注释 --,--后面要有个一个空格
- 比如 username 输入为: sanfeng'-- (此处有个空格) 之后的都是注释,
- 在提交数据的时候，都要防止 sql 注入

* 更新数据可能会触发 mysql 的安全模式
  `SET SQL_SAFE_UPDATES=0`

### Koa 实现 session 以及 redis 存储

1. 安装
   npm i koa-generic-session koa-redis redis
2. app.js 中

```js
// 引入session以及session存储的机制 redis
const session = require("koa-generic-session");
const redisStore = require("koa-redis");

// 在"注册"路由之前配置session
app.keys = ["ROOTsanfeng123"];
app.use(
  session({
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    },
    store: redisStore({
      all: "127.0.0.1:6379" // 先写死本地的redis
    })
  })
);

// 注册路由
app.use(user.routes(), user.allowedMethods());
app.use(blog.routes(), blog.allowedMethods());
```

3. 在 user.js 写一个测试 session 的接口

```js
router.get("/session-test", async (ctx, next) => {
  // 此处要使用null, 不能使用===, 否则第一次访问返回的viewCount是null
  if (ctx.session.viewCount == null) {
  }
});
```

> 单独判断是否 nul

```js
let str = null;
console.log(str == null); // true
console.log(str === null); // true
```

> 同时判断 null 和 undefined
>
> 虽然 null 和 undefined 不一样，但是这样判断确实是可行的

```js
let str = null;
str == null; //true
str = undefined;
str == null; // true
```

> 同时判断 null、undefined、数值 0、false

```js
if (!str) {
  console.log("---------");
}
```

### Koa 中的日志

`npm i koa-morgan`

app.js

```js
// 日志记录
const path = require("path");
const fs = require("fs");
const morgan = require("koa-morgan");
```

```js
// 日志记录到文件access.log
const ENV = process.env.NODE_ENV;
if (ENV !== "production") {
  // 开发或测试环境
  app.use(morgan("dev"));
} else {
  const logFileName = path.join(__dirname, "logs", "access.log");
  const ws = fs.createWriteStream(logFileName, {
    flags: "a"
  });
  app.use(
    morgan("combined", {
      stream: ws
    })
  );
}
```

KOA2 中间件原理

回顾使用

分析如何使用

分析

1. app.use 注册中间件 收集起来
2. 实现 next 机制，即上一个通过 next 触发下一个
3. 不涉及 method 和 path 的判断，因为没有路由功能

### pm2 线上环境配置

安装 npm i pm2 -g

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=env nodemon app.js",
    "prd": "cross-env NODE_ENV=production pm2 start app.js"
  },
```

npm run prd

\$ pm2 list
┌─────┬──────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───
────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name │ namespace │ version │ mode │ pid │ uptime │ ↺ │ status │ cpu │ mem │ user │ watching │
├─────┼──────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───
────────┼──────────┼──────────┼──────────┼──────────┤
│ 0 │ app │ default │ 1.0.0 │ fork │ 21256 │ 23s │ 0 │ online │ 0% │ 29.1mb │ CNZ… │ disabled │
└─────┴──────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───
────────┴──────────┴──────────┴──────────┴──────────┘

常用命令

```bash
pm2 start app.js 或者配置文件
pm2 list
pm2 restart <AppName>/<id>
pm2 stop <AppName>/<id>
pm2 delete <AppName>/<id>
pm2 info <AppName>/<id>
pm2 log <AppName>/<id>
pm2 monit <AppName>/<id>   // CPU 内存情况
```

总结

1. 与 nodemon 的区别，nodemon 是前台执行的, 当前窗口一直挂起，pm2 会把执行权限交还给用户，不挂起

#### 进程守护

node app.js 和 nodemon 进程崩溃则不能访问，nodemon 会自动监听自动启动

pm2 遇到进程崩溃，会自动重启

### 配置

- 新建 pm2 配置文件（包括进程数量，日志文件目录等）
- 修改 pm2 启动命令，重启
- 访问 server 检查日志文件的内容（日志记录是否生效）

新建配置文件 pm2.config.json

新建目录 logs 目录, err.log, out.log

```json
{
  "apps": {
    "name": "pm2-test-server",
    "script": "app.js",
    "watch": true,
    "ignore_watch": ["node_modules", "logs"],
    "error_file": "logs/err.log",
    "out_file": "logs/out.log",
    "log_date_format": "YYYY-MM-DD HH:mm:ss"
  }
}
```

修改 package.json 的启动命令

```json
{
  "prd": "cross-env NODE_ENV=production pm2 start pm2.conf.json"
}
```

然后命令

pm2 stop app,

pm2 delete app

```js
const http = require("http");
let count = 0;
const server = http.createServer((req, res) => {
  console.log(
    req.url,
    " -- ",
    req.method,
    " -- ",
    req.url.indexOf("?") >= 0 ? req.url.split("?")[1].split("=")[1] : "none"
  );

  if (req.url === "/favicon.ico") {
    // console.log('再/favicon.ico中打印');
    return;
  }
  console.log("正常日志记录在文件中");
  if (req.url === "/err") {
    throw new Error("假装出错了,也会记录在日志中");
  }
  res.end(
    JSON.stringify({
      username: "sanfeng",
      age: count++
    })
  );
});

server.listen(8080, () => {
  console.log("server start at port 8080");
});
```

![image-20191127215102440](C:\Users\CNZHLIU14\AppData\Roaming\Typora\typora-user-images\image-20191127215102440.png)

#### 为何使用多进程

- 回顾 session 时说过，操作系统限制一个进程的内容，32 位 OS, 一个进程大概是 1.6G 内存
- 内存：无法充分利用机器全部内存
- CPU: 无法充分利用多核 CPU 的优势, 一个核就可以启动一个进程，8 核就可以有 8 个进程，加入每个进程占用 1.6G，那就可以使用 1.6\*8=12.8G 左右的内存

多进程和 redis

1. 系统内存中，多个进程之间的内存是无法共享的，就如同 session，qq 的 session 不能和淘宝的 session 共享内存，否则就乱套了
2. ![image-20191127215654772](C:\Users\CNZHLIU14\AppData\Roaming\Typora\typora-user-images\image-20191127215654772.png)

3) 解决方法就是把多进程中使用到的 session 保存到 redis 中

![image-20191127215742246](C:\Users\CNZHLIU14\AppData\Roaming\Typora\typora-user-images\image-20191127215742246.png)

- 多进程之间，内存无法共享，这也是多进程带来的弊端，不过这也是现状

- 多进程访问一个 redis，实现数据共享，这也是 redis 的核心价值之一

多进程的配置

```js
"instances": 4
```

如果是多个实例，就会生成对应的个数实例的 log 日志，out.log,err.log 各 4 个日志

pm2 内部实现了负载均衡，每个日志记录的数量可能也不一样

```json
{
  "apps": {
    "name": "pm2-test",
    "script": "app.js",
    "watch": true,
    "ignore_watch": ["node_modules", "logs"],
    "instances": 6,
    "error_file": "logs/err.log",
    "out_file": "logs/out.log",
    "log_date_format": "YYYY-MM-DD HH:mm:ss"
  }
}
```

![image-20191127222525672](C:\Users\CNZHLIU14\AppData\Roaming\Typora\typora-user-images\image-20191127222525672.png)

### 代码回顾

#### 1. 原生 nodejs

- 请求 url 处理，path query
- 解析头部 header 中的 cookie，将 cookie 设置到 req.cookie 上
- 如果没有 cookie，就创建一个随机串儿，在 redis 中设置这个 key，并初始化为{}
- 每次请求前，先从 redis 中 get key，看看是否存在 val 值，也就是 redis 中是否存在 session 信息
- 如果存在就设置到 req.session 上，没有就设置 redis 的 val 为{}
- 当用户登录之后，从 db 中获取了用户的信息之后，将数据设置到 redis.set(userid, userinfo)

### koa 开发流程

1. model 中定义的 successModel, ErrorModel
2. config 配置文件，连接 mysql redis 的相关配置
3. 修改 controller 中相关的取数逻辑，在 app 中修改 session 的配置
4. 编写路由，返回给前端相关数据

```js
app.keys = ["ROOTsanfeng123"];
app.use(
  session({
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    },
    store: redisStore({
      all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
    })
  })
);
```

5. 编写连接数据库的封装函数

```js
// db/db.js
const mysql = require("mysql");
const { MYSQL_CONF } = require("../config/db");
const conn = mysql.createConnection(MYSQL_CONF);
// 开始连接
conn.connect();
// 传入sql, 执行, 返回promise
const exec = sql => {
  const promise = new Promise((resolve, reject) => {
    conn.query(sql, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
  return promise;
};

module.exports = {
  exec,
  escape: mysql.escape
};
```

6. 编写 controller

- blog

```js
const { exec, escape } = require("../db/mysql");
const xss = require("xss");

// 获取博客列表
const getList = async (author, keyword) => {
  let sql = `select * from blogs where 1=1 `;
  if (author) {
    author = escape(author);
    sql += `and author = ${author} `;
  }
  if (keyword) {
    keyword = escape(keyword);
    sql += `and title like %${keyword}% `;
  }
  sql += `order by createtime desc;`;

  // 返回promise
  return await exec(sql);
};

// 获取详情
const getDetail = async (id, author) => {
  let sql = `select * from blogs where 1=1 `;
  if (id) {
    sql += `and id = ${id} `;
  }
  if (author) {
    author = escape(xss(author));
    sql += `and author=${author}`;
  }
  console.log("getDetail sql: ", sql);
  const rows = await exec(sql);
  return rows[0];
};

const newBlog = async (data = {}) => {
  // 其中author是假数据
  let { title, content, author } = data;
  const createtime = Date.now();
  title = escape(xss(title));
  content = escape(xss(content));
  author = escape(xss(author));

  const sql = `
    insert into blogs (title, content, createtime, author)
    values(${title}, ${content}, ${createtime}, ${author})
  `;
  console.log("new blog sql: ", sql);
  const insertData = await exec(sql);
  return {
    id: insertData.insertId
  };
};

// 更新博客
const updateBlog = async (id, blogData = {}) => {
  let { title, content } = blogData;
  title = escape(xss(title));
  content = escape(xss(content));

  let sql = `update blogs set title=${title}, content=${content} where id=${id}`;

  console.log("update blog sql: ", sql);
  const updateData = await exec(sql);
  if (updateData.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
};

const deleteBlog = async (id, author) => {
  author = escape(xss(author));
  const sql = `delete from blogs where id=${id} and author=${author}`;
  console.log("delete blog sql: ", sql);
  const delData = await exec(sql);
  if (delData.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
};

// 在router中使用controller
module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
};
```

- controller/user

```js
const { exec, escape } = require("../db/mysql");
const xss = require("xss");
const { genPassword } = require("../utils/crypto");

const login = async (username, password) => {
  username = escape(xss(username));
  // 先加密,后防止sql注入攻击
  password = genPassword(password);
  password = escape(password);
  const sql = `select username, realname from users 
    where username=${username} and pwd=${password}`;
  const rows = await exec(sql);
  return rows[0] || {};
};

// 用户注册
const register = async (data = {}) => {
  let { username, password } = data;
  const createtime = Date.now();
  username = escape(xss(username.trim()));
  password = genPassword(password.trim());
  password = escape(password);

  const sql = `
    insert into users(username, pwd, createtime) values(${username}, ${password}, ${createtime})
  `;
  console.log("register sql: ", sql);
  // 执行新建用户, promise返回自定义的insertId, 可以返回任何rows对象中的属性

  const rows = await exec(sql);
  return {
    id: rows.insertId
  };
};

module.exports = {
  login,
  register
};
```

- 其中 userController 中使用了 utils/crypto.js 中的密码加密

```js
const crypto = require("crypto");
const SECRETKEY = "HELLOworld";

const md5 = content => {
  const md5 = crypto.createHash("md5");
  return md5.update(content).digest("hex");
};

const genPassword = password => {
  let str = `password=${password}&key=${SECRETKEY}`;
  return md5(str);
};

module.exports = genPassword;
```

- 用于验证是否登录的中间件 loginCheck

```js
// 登录验证中间件, 用于判断session中是否有username, 如果有就认为已经登录
const { ErrorModel } = require("../model/resModel");
module.exports = async (ctx, next) => {
  if (ctx.session.username) {
    await next();
    return;
  }
  ctx.body = new ErrorModel("未登录");
};
```

#### 编写路由

路由的编写要把对 controller 的，model(SuccessModel,ErrorModel)，中间件(loginCheck)的引用

blog.js

```js
const router = require("koa-router")();
router.prefix("/api/blog");

const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
} = require("../controller/blog");
const { SuccessModel, ErrorModel } = require("../model/resModel");
const loginCheck = require("../middlewares/loginCheck");

router.get("/list", async (ctx, next) => {
  let author = ctx.query.author || "";
  let keyword = ctx.query.keyword || "";
  let isadmin = ctx.query.isadmin;

  if (isadmin) {
    if (!ctx.session.username) {
      ctx.body = new ErrorModel("未登录");
      return;
    }
    // 强制查询自己的博客
    author = ctx.session.username;
  }

  const listData = await getList(author, keyword);
  ctx.body = new SuccessModel(listData);
});

// 根据id查询博客的详情,但是要通过sql的筛选,必须是自己的博客
// 根据url传入id=1,查询id=1的博客明细
router.get("/detail", async (ctx, next) => {
  const author = ctx.session.username;
  const result = await getDetail(ctx.query.id, author);
  ctx.body = new SuccessModel(result);
});

/**
 * 新建博客, 需要验证是否已经登录
 */
router.post("/new", loginCheck, async (ctx, next) => {
  // post提交的数据
  const body = ctx.request.body;
  body.author = ctx.session.username;
  const data = await newBlog(req.body);
  ctx.body = new SuccessModel(data);
});

/**
 * 更新博客
 */

router.post("/update", loginCheck, async (ctx, next) => {
  const val = await updateBlog(ctx.query.id, ctx.request.body);
  if (val) {
    ctx.body = new SuccessModel(val);
  } else {
    ctx.body = new ErrorModel("更新博客失败");
  }
});

router.post("/delete", loginCheck, async (ctx, next) => {
  const author = ctx.session.username;
  const val = await deleteBlog(ctx.query.id, author);
  if (val) {
    ctx.body = new SuccessModel(result);
  } else {
    ctx.body = new ErrorModel("删除博客失败");
  }
});

module.exports = router;
```

user.js

```js
const router = require("koa-router")();
router.prefix("/api/user");
const { login, register } = require("../controller/user");
const { SuccessModel, ErrorModel } = require("../model/resModel");

router.post("/login", async (ctx, next) => {
  const { username, password } = ctx.request.body;
  const data = await login(username, password);
  if (data.username) {
    // 设置session
    ctx.session.username = data.username;
    ctx.session.realname = data.realname;
    ctx.body = new SuccessModel();
    return;
  }
  ctx.body = new ErrorModel("登录失败");
});

// 测试session
router.get("/session-test", async (ctx, next) => {
  console.log(ctx.session.viewCount);
  if (!ctx.session.viewCount) {
    ctx.session.viewCount = 0;
  }
  // 只要是操作了session, 就会将session中的相关数据,保存在redis中
  // 通过redis-cli或者其他代码, 获取redis中的key值
  ctx.session.viewCount++;
  ctx.body = {
    errorno: 0,
    viewCount: ctx.session.viewCount
  };
});

module.exports = router;
```

#### koa 中的日志记录

`npm install koa-morgan`

logs/access.log 记录用户的访问日志

app.js

```js
// 日志记录
const path = require("path");
const fs = require("fs");
const morgan = require("koa-morgan");
```

app.js

```js
// 日志记录到文件access.log
const ENV = process.env.NODE_ENV;
if (ENV !== "production") {
  // 开发或测试环境
  app.use(morgan("dev"));
} else {
  const logFileName = path.join(__dirname, "logs", "access.log");
  const ws = fs.createWriteStream(logFileName, {
    flags: "a"
  });
  app.use(
    morgan("combined", {
      stream: ws
    })
  );
}
```

### koa 原理

```js
// 1. 收集middle
// 2.

const http = require("http");

function compose(middlewares) {
  return function(ctx) {
    function dispatch(i) {
      const fn = middlewares[i];
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

class MyKoa {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  createContext(req, res) {
    return {
      req,
      res
    };
  }

  handleRequest(ctx, fn) {
    return fn(ctx);
  }

  callback() {
    return (req, res) => {
      // 执行每一个中间件,之前要先组合中间件, 组合之前要先创建上下文,把req res组合起来
      const ctx = this.createContext(req, res);
      const fn = compose(this.middlewares);
      return this.handleRequest(ctx, fn);
    };
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
  }
}

module.exports = MyKoa;
```
