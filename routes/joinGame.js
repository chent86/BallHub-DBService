var express = require('express');
var router = express.Router();
var handler = require('../handler')
var connection = handler.connection();

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    var info = req.body.gameInfo;
    handler.getUserInfo(data, (userInfo) => {  
      if( userInfo !== 'error') {
        connection.query('INSERT into attend(uid,gid,role) values(?,?,"参与者")',
        [userInfo.uid, info.gid], (err, rows, fields) => {
          if(err) {
            res.send('error');
          } else {
            res.send('ok');
          }
        });         
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
