var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ball',
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
////////////////////////////////////////////////////////////////////////////
//#login    
    if(req.path == "/api/login") {
        connection.query('SELECT * FROM user where username="'+req.body.username+'" and password="'+req.body.password+'"', function(err, rows, fields) {
            if(rows.length == 0) {
                console.log("error password");
                res.status(401).send('ERROR PASSWORD');
                return;
            } else {
                var role = rows[0].role;
                console.log(role);
                connection.query('SELECT * from user,?? where user.username=? and ??.username=?',
                [role, req.body.username, role, req.body.username],
                function(err, rows, fields) {
                    console.log(rows);
                    res.send(rows[0]);                    
                });
            }
        });
    }
////////////////////////////////////////////////////////////////////////////
//#getUserInfo     
    if(req.path == "/api/getUserInfo") {
        console.log(req.body);                  //用于处理cookies登录
        if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
            res.status(401).send('ERROR');
            return; 
        } else {
            var data = JSON.parse(req.body.cookies);
            connection.query('SELECT * FROM user where username="'+data.username+'" and password="'+data.password+'"', function(err, rows, fields) {
                if(rows.length == 0) {
                    console.log("error");
                    res.status(401).send('ERROR');
                    return;                     
                } else {
                    console.log("ok");
                    var role = rows[0].role;
                    connection.query('SELECT * from user,?? where user.username=? and ??.username=?',
                    [role, data.username, role, data.username],
                    function(err, rows, fields) {
                        console.log(rows);
                        res.status(200).send(rows[0]);                    
                    });
                }
            });            
        }
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
        connection.query('SELECT * FROM user where username="'+req.body.username+'"', function(err, rows, fields) {
            if(rows.length == 0) {
                connection.query('INSERT into user (username, password, role) values (?,?,?)',
                [req.body.username, req.body.password, req.body.role],function(err, rows, fields) {
                    connection.query('INSERT into ?? (username) values (?)',
                    [req.body.role, req.body.username],function(err, rows, fields) {
                        if(err)
                            console.log(err);                        
                        res.status(200).send('OK');                  
                    });                                    
                });
            } else {
                console.log("username has been used!");
                res.status(401).send('USERNAME HAS BEEN USED');
                return;
            }
        });
    }
////////////////////////////////////////////////////////////////////////////
//#updateLoginInfo
    if(req.path == "/api/updateLoginInfo") {
        console.log('update');
        console.log(req.body);
        if(JSON.stringify(req.body) == '{}' || req.body.cookies == '') {
            res.status(401).send('ERROR');
            return; 
        }
        var data = JSON.parse(req.body.cookies);
        connection.query('SELECT * FROM user where username="'+data.username+'" and password="'+data.password+'"', function(err, rows, fields) {
            if(rows.length == 0) {
                console.log("error");
                res.status(401).send('ERROR');
                return;                     
            } else {
                var role = rows[0].role;
                var info = req.body.userInfo;
                if(role == 'player') {
                    connection.query('UPDATE player set age=?,sex=?,free_time=? where username=?',
                    [info.age, info.sex, info.free_time, data.username],
                    function(err) {
                        if(err) {
                            res.status(401).send('Update Error!'); 
                        } else {
                            res.status(200).send('ok');    
                        }                
                    });                    
                } else if(role == 'referee') {
                    connection.query('UPDATE referee set age=?,sex=?,free_time=?,price=? where username=?',
                    [info.age, info.sex, info.free_time,info.price, data.username],
                    function(err) {
                        if(err) {
                            console.log(err);
                            res.status(401).send('Update Error!');
                        } else {
                            res.status(200).send('ok');  
                        }                  
                    });  
                } else if(role == 'team') {
                    connection.query('UPDATE team set free_time=?,team_name=? where username=?',
                    [info.free_time,info.team_name, data.username],
                    function(err) {
                        if(err) {
                            console.log(err);
                            res.status(401).send('Update Error!'); 
                        } else {
                            res.status(200).send('ok'); 
                        }                   
                    });                     
                }
            }
        });   
    }     
})

var server = app.listen(8000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Database is runing in http://localhost:8000");
})