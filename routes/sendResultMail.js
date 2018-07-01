var express = require('express');
var router = express.Router();
var handler = require('../handler')

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    handler.getUserInfo(data, (userInfo) => {  
      if( userInfo !== 'error') {
        var connection = handler.connection();
        connection.query('select * from \
        (select * from game where end_time <= DATE_ADD(NOW(), INTERVAL 8 HOUR) and valid = 1)a,\
        (select gid from attend where uid=?)b \
        where a.gid = b.gid',  // 获得刚过时的所有比赛的gid
        [userInfo.uid],(err, rows, fields) => {
          var outDate = rows;
          if(err) { console.log(err); res.send('error'); connection.end();}
          else {
            if(outDate.length == 0) {
              res.send('ok');
              connection.end();
            } else {
              for(i = 0; i < outDate.length; i++) {
                (i => {
                  var connection = handler.connection();
                  connection.query('update game set valid = 0 where gid = ?',  // 将球局设为过期球局
                  [outDate[i].gid],(err, rows, fields) => {
                    connection.query('select uid from attend where gid=?',  // 获得该球局的所有用户id
                    [outDate[i].gid],(err, rows, fields) => {
                      var user = rows;
                      connection.query('insert into mail(gid, message, sender, type)values(?,"您有一场比赛结果需要填写","BallHub团队","result")',
                      [outDate[i].gid],(err, rows, fields) => {
                        for(j = 0; j < user.length; j++) { //为所有用户添加邮件，提醒写入个人比赛结果(邮件只有一封，作为共用群发邮件)
                          ((j) => {                    //此处每个循环都要新建一次连接，这样才能取到正确的mid
                              connection.query('insert into receive(uid, mid)values(?, LAST_INSERT_ID())',
                              [user[j].uid],(err, rows, fields) => {
                                  if(i == outDate.length-1 && j == user.length-1) {
                                    res.send('ok');
                                    // connection.end();   TODO:使用async模块
                                  }
                              });                       
                          })(j);
                        }
                      });                    
                    });              
                  });
                })(i);
              }
            }
          } 
        });     
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
