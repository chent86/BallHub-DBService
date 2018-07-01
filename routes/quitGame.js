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
        connection.query('SELECT role from attend where uid=? and gid=?',
        [userInfo.uid, info.gid],(err, rows, fields) => {
          if(err) { console.log(err); res.send('error'); connection.end();} 
          else {
            if(rows[0].role == '组织者') {
              connection.query('DELETE from game where gid=?',
              [info.gid], (err, rows, fields) => {
                if(err) { console.log(err); res.send('error'); }
                else { res.send('ok'); }
                connection.end();
              });                
            } else if(rows[0].role == '参与者') {
                connection.query('DELETE from attend where uid=? and gid=?',
                [userInfo.uid, info.gid], (err, rows, fields) => {
                  if(err) { console.log(err); res.send('error'); connection.end();}
                  else {
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
                            delete data[userInfo.uid];
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
                  }
                });                   
            } else { res.send('error'); connection.end();}
          }
        });        
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
