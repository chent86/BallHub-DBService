var express = require('express');
var router = express.Router();
var handler = require('../handler')

router.get('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    handler.getUserInfo(data, (userInfo) => {  
      if( userInfo !== 'error') {
        var connection = handler.connection();
        connection.query('select * from court',
        (err, rows, fields) => {
          for(i = 0; i < rows.length; i++)
            rows[i].value = rows[i].location + " 场地编号: " + rows[i].cid;
          res.send(rows);
          connection.end();  
        });     
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
