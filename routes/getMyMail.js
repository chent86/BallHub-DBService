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
        (select * from mail)a, \
        (select * from receive)b \
        where a.mid=b.mid and b.uid=?',
        [userInfo.uid],(err, rows, fields) => {
          res.send(rows);
          connection.end();
        });         
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
