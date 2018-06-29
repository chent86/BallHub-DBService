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
        var connection = handler.connection();
        connection.query('select * from (select gid,count(uid) from \
        attend group by attend.gid)a,\
        (select * from game)b,\
        (select gid,role from attend where uid=?)c,\
        (select cid,location from court)d,\
        (select cid,gid from locate)e\
        where a.gid=b.gid and b.gid=c.gid and c.gid=e.gid and d.cid=e.cid and b.end_time > now()',
        [userInfo.uid], (err, rows, fields) => {
          if(err) console.log(err);  
          res.send(rows); // a: 获得每个球局的参与人数   b:获得球局信息   c:获得指定id的球员的角色
          connection.end();  // d:获得指定球局的球场id  e:获得球场信息
        });               
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
