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
        connection.query('select * from \
        (select gid,count(uid) from attend group by attend.gid)a,\
        (select * from game)b,\
        (select cid,location from court)c,\
        (select cid,gid from locate)d \
        where a.gid=b.gid and b.gid=d.gid and d.cid=c.cid and b.end_time > DATE_ADD(NOW(), INTERVAL 8 HOUR) and b.valid=1',
        (err, rows, fields) => {  // a: 获得每个球局的参与人数   b:获得球局信息
          if(err) { console.log(err); console.log(err);} // c:获得指定球局的球场id  d:获得球场信息
          else { res.send(rows);}  // 选择时判断球局是否已经结束
          connection.end();
        });         
      } else {
        res.send('error');
      }     
    });
  }
});

module.exports = router;
