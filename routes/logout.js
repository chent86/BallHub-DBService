var express = require('express');
var router = express.Router();
var handler = require('../handler')
var cookie = require('cookie');

router.post('/', function(req, res, next) {
  res.setHeader('Set-Cookie', cookie.serialize('BallHub', "{}", {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    path: '/api'
  }));
  res.status(200).send('Logout success');
});

module.exports = router;
