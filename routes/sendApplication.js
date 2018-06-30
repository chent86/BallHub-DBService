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
        var gid = req.body.applyInfo.gid;
        connection.query('select uid from attend where gid=? and role="组织者"', 
        [gid],(err,rows,fields) => {
          if(err) { console.log(err); res.send('error'); connection.end();}
          else {
            var uid = rows[0].uid;
            connection.query('insert into mail(gid, message, sender, type)values(?,"您收到一封球赛申请",?,"apply")', 
            [gid, userInfo.username],(err,rows,fields) => {
              if(err) {console.log(err); res.send('error'); connection.end();}
              else {
                connection.query('insert into receive(uid, mid)values(?, LAST_INSERT_ID())', 
                [uid],(err,rows,fields) => {
                  if(err) {console.log(err); res.send('error');}
                  else { res.status(200).send('ok');}
                  connection.end();
                });            
              }
            });
          }
        });          
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
