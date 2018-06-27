var express = require('express');
var router = express.Router();
var handler = require('../handler')
var connection = handler.connection();

router.post('/', (req, res, next) => {
  var data = req.body;
  if(JSON.stringify(data) == '{}') {
    res.status(401).send('ERROR');
  } else {
    connection.query('INSERT into user (username, password) values (?,?)', //添加信息到user
    [data.username, data.password],(err, rows, fields) => {
      // 通过LAST_INSERT_ID()获得当前connection的最新的自增id(不会有出错的风险且没有上锁的必要)
      if(err) { 
        res.send('error');
      } else {
        connection.query('INSERT into ISA(uid,role) values (LAST_INSERT_ID(),?)',  //添加信息到ISA
        [data.role],(err,rows,fields) => {
          connection.query('INSERT into ?? (rid) values (LAST_INSERT_ID())', //添加信息到具体表
          [data.role],(err,rows,fields) => {
            if(err) { 
              res.send('error');
            } else { 
              res.status(200).send('ok');
            }
          });  
        }); 
      }           
    });
  }
});

module.exports = router;
