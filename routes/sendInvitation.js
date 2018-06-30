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
        var info = req.body.inviteInfo;
        connection.query('select username from user where uid=?', 
        [userInfo.uid],(err,rows,fields) => {
          if(err) {res.send('error'); connection.end();}  
          connection.query('insert into mail(gid, message, sender, type)values(?,"您收到一封球赛邀请",?,"invitation")', 
          [info.gid, rows[0].username],(err,rows,fields) => {
            if(err) {res.send('error'); connection.end();}
            else {
              connection.query('insert into receive(uid, mid)values(?, LAST_INSERT_ID())', 
              [info.uid],(err,rows,fields) => {
                if(err) {res.send('error');}
                else { res.status(200).send('ok');}
                connection.end();
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
