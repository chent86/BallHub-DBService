var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'BallHub',
  insecureAuth : true,
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.get(/\//, function (req, res) {
  console.log("GET "+req.path);
  connection.query('SELECT * FROM user', function(err, rows, fields) {
    if (err) throw err;
    if(rows)
    console.log(rows.length);
    res.send(rows);
  });
  // console.log(req.cookies);
})

app.post(/\//, function (req, res) {
    console.log("POST "+req.path);
    console.log(req.body);
////////////////////////////////////////////////////////////////////////////
//#login   正常登录 
//#getUserInfo   通过Cookies登录
  if(req.path == "/api/login" || req.path == "/api/getUserInfo") {
    var data;
    if(req.path == "/api/getUserInfo") {
      if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
        res.status(401).send('ERROR');
        return; 
      } else {
        data = JSON.parse(req.body.cookies);
      }
    } else {
      data = req.body;
    }
    console.log(data);
    //确认用户名和密码正确
    connection.query('SELECT * FROM user where username=? and password=?',
    [data.username, data.password],
    function(err, rows, fields) {
      if(rows.length == 0) {
        console.log("error password");
        res.status(401).send('ERROR PASSWORD');
        return;
      } else {
        console.log(rows[0]);
        var id = rows[0].uid;
        //在ISA关系中查找该用户的角色
        connection.query('SELECT role from ISA where uid=?',
        [id],
        function(err, rows, fields) {
          //通过用户id从user表和对应角色(player/referee/team)表中获得用户信息
          connection.query('SELECT * from user,ISA,?? where user.uid=? and ISA.uid=? and ??.uid=?',
          [rows[0].role, id, id, rows[0].role, id],
          function(err, rows, fields) {
            console.log(rows);
            res.status(200).send(rows[0]);
          });                    
        });
      }
    });
  }
////////////////////////////////////////////////////////////////////////////
//#logout      
  if(req.path == "/api/logout") {
    res.status(200).send('Logout success');
    return;
  }
////////////////////////////////////////////////////////////////////////////
//#register   
  if(req.path == "/api/register") {
    connection.query('SELECT * FROM user where username=?',
    [req.body.username],
    function(err, rows, fields) {
      if(rows.length == 0) {
        connection.query('INSERT into user (username, password) values (?,?)',
        [req.body.username, req.body.password],
        function(err, rows, fields) {
          //获取自动生成的pid(自增的一个整数)
          connection.query('SELECT uid from user where username=?',
          [req.body.username],
          function(err,rows,fields) {
            var id = rows[0].uid
            //将用户id加入ISA关系表
            connection.query('INSERT into ISA(uid,role) values (?,?)',
            [id, req.body.role],
            function(err,rows,fields) {
              //将用户id加入具体角色信息表
              connection.query('INSERT into ?? (uid) values (?)',
              [req.body.role, id],
              function(err,rows,fields) {
                res.status(200).send('OK'); 
              });  
            });            
          });
        });
      } else {
        console.log("username has been used!");
        res.send('USERNAME HAS BEEN USED');
        return;
      }
    });
  }
////////////////////////////////////////////////////////////////////////////
//#updateLoginInfo
  if(req.path == "/api/updateLoginInfo") {
    console.log('updateInfo');
    console.log(req.body);
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
        res.status(401).send('ERROR');
        return; 
    }
    var data = JSON.parse(req.body.cookies);
    connection.query('SELECT * FROM user where username=? and password=?',
    [data.username, data.password],
    function(err, rows, fields) {
      if(rows.length == 0) {
        console.log("error");
        res.status(401).send('ERROR');
        return;                     
      } else {
        var id = rows[0].uid;
        console.log(id);
        var info = req.body.userInfo;
        console.log(info);
        connection.query('UPDATE user set name=?,birthday=?,free_time_1=?,free_time_2=? where uid=?',
        [info.name, info.birthday, info.free_time_1, info.free_time_2, id],
        function(err) {
          if(err) {
            console.log(err);
            res.status(401).send('Update Error!');
            return; 
          }
          connection.query('SELECT role from ISA where uid=?',
          [id],
          function(err, rows, fields) {
            var role = rows[0].role;
            if(role == 'player') {
              connection.query('UPDATE player set sex=? where uid=?',
              [info.sex, id],
              function(err) {
                  if(err) {
                      res.status(401).send('Update Error!'); 
                  } else {
                      res.status(200).send('ok');    
                  }                
              });                    
            } else if(role == 'referee') {
                connection.query('UPDATE referee set sex=?,price=? where uid=?',
                [info.sex, info.price, id],
                function(err) {
                    if(err) {
                        console.log(err);
                        res.status(401).send('Update Error!');
                    } else {
                        res.status(200).send('ok');  
                    }                  
                });  
            } else if(role == 'team') {
                connection.query('UPDATE team set motto=? where uid=?',
                [info.motto, id],
                function(err) {
                    if(err) {
                        console.log(err);
                        res.status(401).send('Update Error!'); 
                    } else {
                        res.status(200).send('ok'); 
                    }                   
                });                     
            }
          });            
        });           
      }
    });   
  }
////////////////////////////////////////////////////////////////////////////
//#updatePassword
    if(req.path == "/api/updatePassword") {
        console.log(req.body);
        var data=req.body.userInfo;
        connection.query('SELECT uid FROM user where username=? and password=?',
        [data.username, data.old_pass],
        function(err, rows, fields) {
            if(rows.length == 0) {
                console.log("error password");
                res.send('error');
                return;
            } else {
                connection.query('UPDATE user set password=? where uid=?',
                [data.new_pass, rows[0].uid],
                function(err, rows, fields) {
                    if(err) {
                        console.log(err);
                        res.send('error');
                    } else {
                        res.status(200).send('ok');
                    }                 
                });
            }
        });        
    }
})

var server = app.listen(8000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Database is runing in http://localhost:8000");
})