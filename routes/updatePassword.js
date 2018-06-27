var express = require('express');
var router = express.Router();
var handler = require('../handler')
var connection = handler.connection();
var cookie = require('cookie');

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
          else {
            var new_cookie = {
              "username": data.username,
              "password": info.new_pass
            };
            res.setHeader('Set-Cookie', cookie.serialize('BallHub', JSON.stringify(new_cookie), {
              httpOnly: true,
              maxAge: 60 * 60 * 24, // 1 day
              path: '/api'
            }));            
            res.status(200).send('ok'); 
          }                 
        });  
      } else {
        res.send('error');
      }              
    });
  }
});

module.exports = router;
