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
        var info = req.body.pigeonInfo;
        connection.query('select username from user where uid=?', 
        [userInfo.uid],(err,rows,fields) => {
          if(err) { console.log(err); res.send('error'); connection.end();}  
          connection.query('insert into mail(gid, message, sender, type)values(?,"您收到一封退赛通知",?,"pigeon")', 
          [info.gid, rows[0].username],(err,rows,fields) => {
            if(err) { console.log(err); res.send('error'); connection.end();}
            else {
              connection.query('select uid from attend where gid=? and uid<>?', 
              [info.gid, userInfo.uid],(err,rows,fields) => {
                var uid_set=rows;
                connection.query('select LAST_INSERT_ID()',(err,rows,fields) => {
                  var mid = rows[0]['LAST_INSERT_ID()'];
                  connection.end();
                  if(err) { console.log(err); res.send('error');}
                  else {
                    for(i = 0; i < uid_set.length; i++) {
                      ((i) => {
                        var connection = handler.connection(); //新建连接后，之前的LAST_INSERT_ID()也丢失了
                        connection.query('insert into receive(uid, mid)values(?, ?)', //所以上面对它进行了保存
                        [uid_set[i].uid, mid],(err,rows,fields) => {
                          if(err) { console.log(err); res.send('error');}
                          else if(i == uid_set.length-1) {  // todo: use async
                            res.status(200).send('ok');
                          }
                          connection.end();
                        });  
                      })(i);
                    }
                  }  
                });              
              });          
            }
          });
        });       
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
