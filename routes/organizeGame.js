var express = require('express');
var router = express.Router();
var handler = require('../handler')
var connection = handler.connection();

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    handler.getUserInfo(data, (userInfo) => {  
      if( userInfo !== 'error') {
        var info = req.body.gameInfo;
        connection.query('INSERT into game(start_time, end_time, type, number)values(?,?,?,?)',
        [info.start_time, info.end_time, info.type, info.number],
        (err, rows, fields) => {
          if(err) {
            res.send('error');
          } else {
            connection.query('INSERT into attend(uid,gid,role)values(?,LAST_INSERT_ID(),"组织者")',
            [userInfo.uid], (err, rows, fields) => {
              if(err) { res.send('error');} 
              else { res.send('ok');}
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
