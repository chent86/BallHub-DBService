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
        connection.query('select * from (select gid,count(uid) from attend group by attend.gid)a,(select * from game)b where a.gid=b.gid',
        (err, rows, fields) => {
          res.send(rows);
        });         
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
