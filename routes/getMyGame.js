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
        connection.query('select * from (select gid,count(uid) from attend group by attend.gid)a,(select * from game)b,(select gid,role from attend where uid=?)c where a.gid=b.gid and b.gid=c.gid',
        [userInfo.uid], (err, rows, fields) => {        
          res.send(rows); //a: 获得每个球局的参与人数   b:获得球局信息   c:获得指定id的球员的角色
        });         
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
