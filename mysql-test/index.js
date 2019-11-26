const mysql = require('mysql')

const config = {
  host: "127.0.0.1",
  user: "root",
  password: '123456',
  port: '3306',
  database: "blogs"
}

const conn = mysql.createConnection(config)
// const sql = "insert into users(username, password, realname) values('zhangsan','123qwe', '张三')"
let sql = "insert into blogs(title, content, createtime, author) values('A title', '这是一个内容A', '1574296131624', '三丰')"
// let sql = "select * from users"

conn.query(sql, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data);
})

conn.end()