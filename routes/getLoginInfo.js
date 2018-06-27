var express = require('express');
var router = express.Router();
var handler = require('../handler');
var cookie = require('cookie');

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    handler.getUserInfo(data, (info) => {
      if(info === 'error') {
        res.status(401).send('ERROR');
      } else { 
        res.status(200).send(info);
      }
    }); 
  }
});

module.exports = router;
