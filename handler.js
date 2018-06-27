var mysql = require('mysql');
var cookie = require('cookie');
var handler = {
  connection : () => {
    return mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'BallHub',
      port: 3307,
      insecureAuth : true,
    });
  },
  check : (req) => {  // 返回用户名与密码(cookies优先)
    var cookies = cookie.parse(req.headers.cookie || '');
    if(cookies.BallHub === undefined) {
      return 'error';
    } else {
      data = JSON.parse(cookies.BallHub);
    }
    if(JSON.stringify(data) == '{}') {
      return 'error';
    }
    return data;
  },
  getUserInfo: (data, callback) => {
    var connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'BallHub',
      port: 3307,
      insecureAuth : true,
    });
    connection.query('SELECT * FROM user where username=? and password=?',
    [data.username, data.password], (err, rows, fields) => {
      if(err || rows.length == 0) {
        callback('error');
      } else {
        var id = rows[0].uid;
        //在ISA关系中查找该用户的角色
        connection.query('SELECT * from ISA where uid=?',
        [id], (err, rows, fields) => {
          //通过用户id从user表和对应角色(player/referee/team)表中获得用户信息
          connection.query('SELECT * from user,ISA,?? where user.uid=? and ISA.uid=? and ??.rid=?',
          [rows[0].role, id, id, rows[0].role, rows[0].rid], (err, rows, fields) => {
            callback(rows[0]);
          });                    
        });
      }
    });    
  }
}

module.exports = handler;