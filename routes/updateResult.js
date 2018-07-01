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
        var info = req.body.resultInfo;
        connection.query('SELECT rid from record where gid=?',
        [info.gid], (err, rows, fields) => {
          if(err) { console.log(err); res.send('error');connection.end();} 
          else {
            var rid = rows[0].rid;
            connection.query('SELECT data from result where rid=?',
            [rid], (err, rows, fields) => {
              if(err) { console.log(err); res.send('error');connection.end();} 
              else { 
                var data = JSON.parse(rows[0].data);
                data[userInfo.uid] = {"score" : info.score,"assist" : info.assist,"defend" : info.defend,"rebound": info.rebound};
                connection.query('UPDATE result set data=? where rid=?',
                [JSON.stringify(data),rid], (err, rows, fields) => {
                  if(err) { console.log(err); res.send('error');} 
                  else { res.send('ok'); }
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
