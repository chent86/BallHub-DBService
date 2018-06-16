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
          // //获取自动生成的pid(自增的一个整数)    => fix: 可以通过LAST_INSERT_ID()获得当前connection的最新的id(不会有出错的风险且没有上锁的必要)
          // connection.query('SELECT uid from user where username=?',
          // [req.body.username],
          // function(err,rows,fields) {
          //   var id = rows[0].uid
            //将用户id加入ISA关系表
            connection.query('INSERT into ISA(uid,role) values (LAST_INSERT_ID(),?)',
            [req.body.role],
            function(err,rows,fields) {
              //将用户id加入具体角色信息表
              connection.query('INSERT into ?? (uid) values (LAST_INSERT_ID())',
              [req.body.role],
              function(err,rows,fields) {
                if(err)
                  res.send('error');
                res.status(200).send('ok'); 
              });  
            });            
          // });
        });
      } else {
        console.log("username has been used!");
        res.send('error');
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
            res.send('error');
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
                      res.send('error'); 
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
                        res.send('error');
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
                        res.send('error'); 
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
////////////////////////////////////////////////////////////////////////////
//#updatePassword
  if(req.path == "/api/deleteUser") {
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
      res.status(401).send('ERROR');
      return; 
    } else {
      data = JSON.parse(req.body.cookies);
    }
    connection.query('Delete FROM user where username=? and password=?',
    [data.username, data.password],
    function(err, rows, fields) {
      if(err)
        res.send('error');
      else
        res.status(200).send('ok');
    });     
  }
////////////////////////////////////////////////////////////////////////////
//#getMyGame
  if(req.path == "/api/getMyGame") {
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
      res.status(401).send('ERROR');
      return; 
    } else {
      data = JSON.parse(req.body.cookies);
      connection.query('SELECT * FROM user where username=? and password=?',
      [data.username, data.password],
      function(err, rows, fields) {
        if(err) {
          res.status(401).send('ERROR');
          return; 
        } else {
          connection.query('select * from (select gid,count(uid) from attend group by attend.gid)a,(select * from game)b,(select gid,role from attend where uid=?)c where a.gid=b.gid and b.gid=c.gid',
          [rows[0].uid],                  //a: 获得每个球局的参与人数   b:获得球局信息   c:获得指定id的球员的角色
          function(err, rows, fields) {
            res.send(rows);
          }); 
        }    
      });
    }      
  }

////////////////////////////////////////////////////////////////////////////
//#getAllGame
  if(req.path == "/api/getAllGame") {
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
      res.status(401).send('ERROR');
      return; 
    } else {
      data = JSON.parse(req.body.cookies);
      connection.query('SELECT * FROM user where username=? and password=?',
      [data.username, data.password],
      function(err, rows, fields) {
        if(err) {
          res.status(401).send('ERROR');
          return; 
        } else {
          connection.query('select * from (select gid,count(uid) from attend group by attend.gid)a,(select * from game)b where a.gid=b.gid',
          function(err, rows, fields) {
            res.send(rows);
          }); 
        }    
      });
    }    
    // res.send([{
    //   'start_time': '2018-06-18 16:39:00',
    //   'end_time': '2018-06-16 16:39:00',
    //   'type': '全场',
    //   'number': 10,
    //   'current_number': 5
    // }]);
  }
////////////////////////////////////////////////////////////////////////////
//#organizeGame
  if(req.path == "/api/organizeGame") {
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
      res.status(401).send('ERROR');
      return; 
    } else {
      var data = JSON.parse(req.body.cookies);
      var info = req.body.gameInfo;
    }
    connection.query('SELECT * FROM user where username=? and password=?',
    [data.username, data.password],
    function(err, rows, fields) {
      if(err) {
        res.status(401).send('ERROR');
        return;
      } else {
        var id = rows[0].uid;
        connection.query('INSERT into game(start_time, end_time, type, number)values(?,?,?,?)',
        [info.start_time, info.end_time, info.type, info.number],
        function(err, rows, fields) {
          if(err) {
            res.send('error');
            return;
          } else {
            connection.query('INSERT into attend(uid,gid,role)values(?,LAST_INSERT_ID(),"组织者")',
            [id],
            function(err, rows, fields) {
              if(err) {
                res.send('error');
              } else {
                res.send('ok');
              }
            });            
          }
        });       
      }
    });
  }
////////////////////////////////////////////////////////////////////////////
//#joinGame
  if(req.path == "/api/joinGame") {
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
      res.status(401).send('ERROR');
      return; 
    } else {
      var data = JSON.parse(req.body.cookies);
      var id = req.body.gameInfo.gid;
      connection.query('SELECT * FROM user where username=? and password=?',
      [data.username, data.password],
      function(err, rows, fields) {
        if(err) {
          res.status(401).send('ERROR');
          return;
        } else {
          connection.query('INSERT into attend(uid,gid,role) values(?,?,"参与者")',
          [rows[0].uid, id],
          function(err, rows, fields) {
            if(err) {
              res.send('error');
            } else {
              res.send('ok');
            }
          });          
        }
      });
    }    
  }
////////////////////////////////////////////////////////////////////////////
//#quitGame
  if(req.path == "/api/quitGame") {
    if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
      res.status(401).send('ERROR');
      return; 
    } else {
      var data = JSON.parse(req.body.cookies);
      var gid = req.body.gameInfo.gid;
      connection.query('SELECT * FROM user where username=? and password=?',
      [data.username, data.password],
      function(err, rows, fields) {
        if(err) {
          res.status(401).send('ERROR');
          return;
        } else {
          var uid = rows[0].uid;
          connection.query('SELECT role from attend where uid=? and gid=?',
          [uid, gid],
          function(err, rows, fields) {
            if(err) {
              res.send('error');
            } else {
              if(rows[0].role == '组织者') {
                connection.query('DELETE from game where gid=?',
                [gid],
                function(err, rows, fields) {
                  if(err) {
                    res.send('error');
                  } else {
                    res.send('ok');
                  }
                });                
              } else if(rows[0].role == '参与者') {
                  connection.query('DELETE from attend where uid=? and gid=?',
                  [uid, gid],
                  function(err, rows, fields) {
                    if(err) {
                      res.send('error');
                    } else {
                      res.send('ok');
                    }
                  });                   
              } else {
                res.send('error');
              }
            }
          });          
        }
      });
    }    
  }
})

var server = app.listen(8000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Database is runing in http://localhost:8000");
})