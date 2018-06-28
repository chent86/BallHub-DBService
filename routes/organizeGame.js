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
        var info = req.body.gameInfo;
        var connection = handler.connection();
        connection.query('INSERT into game(start_time, end_time, type, number)values(?,?,?,?)',
        [info.start_time, info.end_time, info.type, info.number],
        (err, rows, fields) => {
          if(err) {
            res.send('error');
            connection.end();
          } else {
            connection.query('INSERT into attend(uid,gid,role)values(?,LAST_INSERT_ID(),"组织者")',
            [userInfo.uid], (err, rows, fields) => {
              if(err) { res.send('error'); connection.end();} 
              else {
                connection.query('INSERT into locate(gid,cid)values(LAST_INSERT_ID(),?)',
                [info.cid], (err, rows, fields) => {
                  if(err) {res.send('err');}
                  else {res.send('ok');}
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
