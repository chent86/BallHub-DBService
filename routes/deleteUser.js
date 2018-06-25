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
        connection.query('Delete FROM user where username=? and password=?',
        [userInfo.username, userInfo.password], (err, rows, fields) => {
          if(err) {res.send('error');}
          else {res.status(200).send('ok');}
        });
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
