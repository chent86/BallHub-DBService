var express = require('express');
var router = express.Router();
var handler = require('../handler');
var cookie = require('cookie');

router.post('/', (req, res, next) => {
  var data = req.body;
  if(JSON.stringify(data) == '{}') {
    res.status(401).send('ERROR');
  } else {
    handler.getUserInfo(data, (info) => {
      if(info === 'error') {
        res.status(401).send('ERROR');
      } else {
        console.log(info);
        res.setHeader('Set-Cookie', cookie.serialize('BallHub', JSON.stringify(data), {
          httpOnly: true,
          maxAge: 60 * 60 * 24, // 1 day
          path: '/api'
        }));
        res.status(200).send(info);
      }
    }); 
  }
});

module.exports = router;
