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
        var mailInfo = req.body.mailInfo;
        var connection = handler.connection();
        connection.query('Delete FROM receive where uid=? and mid=?',
        [mailInfo.uid, mailInfo.mid], (err, rows, fields) => {
          if(err) {console.log(err); res.send('error');}
          else { res.status(200).send('ok');}
          connection.end();
        });
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
