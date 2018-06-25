var express = require('express');
var router = express.Router();
var handler = require('../handler')
var connection = handler.connection();

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  var info = req.body.userInfo;
  if(data === 'error') {
    res.status(401).send('ERROR');
  } 
  else if(data.password !== info.old_pass){
    res.send('error');
  } else {
    handler.getUserInfo(data, (userInfo) => {  
      if(userInfo !== 'error') {
        connection.query('UPDATE user set password=? where uid=?',
        [info.new_pass, userInfo.uid], (err, rows, fields) => {
          if(err) { res.send('error');} 
          else { res.status(200).send('ok'); }                 
        });  
      } else {
        res.send('error');
      }              
    });
  }
});

module.exports = router;
