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
                  if(err) {res.send('error'); connection.end();}
                  else {
                    connection.query('SELECT LAST_INSERT_ID()',
                    (err, rows, fields) => {
                      var gid = rows[0]["LAST_INSERT_ID()"];
                      var result = {};
                      result[userInfo.uid] = {"score" : 0,"assist" : 0,"defend" : 0,"rebound": 0};
                      connection.query('INSERT into result(data)values(?)',
                      [JSON.stringify(result)], (err, rows, fields) => {
                        if(err) {res.send('error'); connection.end();}
                        else {
                          connection.query('INSERT into record(gid,rid)values(?, LAST_INSERT_ID())',
                          [gid], (err, rows, fields) => {
                            if(err) {res.send('error'); connection.end();}
                            else {
                              res.send('ok');
                              connection.end();
                            }
                          });                        
                        }
                      });
                    });
                  }
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
