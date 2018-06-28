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
        var info = req.body.courtInfo;
        var connection = handler.connection();
        connection.query('INSERT into court(creator, location, type, price, link)values(?,?,?,?,0)',
        [userInfo.uid, info.location, info.type, info.price],
        (err, rows, fields) => {
          if(err) { console.log(err);res.send('error');} 
          else { res.send('ok'); }
          connection.end();
        });           
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
