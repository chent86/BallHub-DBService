var express = require('express');
var router = express.Router();
var handler = require('../handler')

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    var info = req.body.gameInfo;
    handler.getUserInfo(data, (userInfo) => {  
      if( userInfo !== 'error') {
        var connection = handler.connection();
        connection.query('SELECT uid from user where username=?',
        [info.username], (err, rows, fields) => {
          var uid=rows[0].uid;
          connection.query('INSERT into attend(uid,gid,role) values(?,?,"参与者")',
          [uid, info.gid], (err, rows, fields) => {
            if(err) { res.send('error');connection.end();} 
            else { 
              connection.query('SELECT rid from record where gid=?',
              [info.gid], (err, rows, fields) => {
                if(err) { res.send('error');connection.end();} 
                else {
                  var rid = rows[0].rid;
                  connection.query('SELECT data from result where rid=?',
                  [rid], (err, rows, fields) => {
                    if(err) { res.send('error');connection.end();} 
                    else { 
                      var data = JSON.parse(rows[0].data);
                      data[uid] = {"score" : 0,"assist" : 0,"defend" : 0,"rebound": 0};
                      connection.query('UPDATE result set data=? where rid=?',
                      [JSON.stringify(data),rid], (err, rows, fields) => {
                        if(err) { res.send('error');} 
                        else { res.send('ok'); }
                        connection.end();
                      });                     
                    }
                  });     
                }
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
