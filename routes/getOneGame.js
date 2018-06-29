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
        var gid = req.body.gid;
        if(gid === undefined)
          res.send('error');
        else {
          connection.query('select * from \
          (select * from game where gid = ?)a,\
          (select * from locate where gid = ?)b,\
          (select cid,location from court)c \
          where b.cid=c.cid',
          [gid, gid], (err, rows, fields) => {        
            res.send(rows[0]);
            connection.end();
          });  
        }             
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
