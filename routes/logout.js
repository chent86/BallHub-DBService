var express = require('express');
var router = express.Router();
var handler = require('../handler')
var connection = handler.connection();

router.post('/', function(req, res, next) {
  res.status(200).send('Logout success');
});

module.exports = router;
