var express = require('express');
var router = express.Router();
var handler = require('../handler');

router.post('/', (req, res, next) => {
  var data = handler.check(req);
  if(data === 'error') {
    res.status(401).send('ERROR');
  } else {
    handler.getUserInfo(data, (userInfo) => {  
      if( userInfo !== 'error') {
        var connection = handler.connection();
        connection.query('select * from \
        (select * from attend)a,\
        (select * from record)b,\
        (select * from result)c,\
        (select * from game)d \
        where a.uid = ? and a.gid=b.gid and b.rid=c.rid and d.gid=a.gid and d.valid=0',
        [userInfo.uid],(err, rows, fields) => {
          if(err) console.log(err);
          var compare = (x,y) => {
            if(x.end_time < y.end_time)
              return -1;
            else if(x.end_time > y.end_time)
              return 1;
            else return 0;
          }
          var rawData = rows.sort(compare);
          if(rawData.length > 7)
            var rawData = rawData.slice(rawData.length-7,rawData.length);
          var scoreData = [];
          var assistData = [];
          var defendData = [];
          var reboundData = [];
          for(i = 0; i < rawData.length; i++) {
            var oneResult = JSON.parse(rawData[i].data);
            scoreData[i] = parseInt(oneResult[userInfo.uid].score);
            assistData[i] = parseInt(oneResult[userInfo.uid].assist);
            defendData[i] = parseInt(oneResult[userInfo.uid].defend);
            reboundData[i] = parseInt(oneResult[userInfo.uid].rebound);
          }
          res.send({
            scoreData,
            assistData,
            defendData,
            reboundData
          });
          // res.send({
          //   'scoreData': [10, 2, 7, 0, 5, 8, 0],
          //   'assistData': [5, 6, 8, 2, 10, 5, 7],
          //   'defendData': [3, 9, 5, 2, 5, 10, 2],
          //   'reboundData': [0, 0, 9, 5, 6, 4, 3]
          // });
          connection.end();
        });       
      } else {
        res.send('error');
      }
    });
  }
});

module.exports = router;

// scoreData: [10, 2, 7, 0, 5, 8, 0],
// assistData: [5, 6, 8, 2, 10, 5, 7],
// defendData: [3, 9, 5, 2, 5, 10, 2],
// reboundData: [10, 8, 9, 5, 6, 4, 3]
