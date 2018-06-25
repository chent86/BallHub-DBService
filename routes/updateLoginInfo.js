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
      if(userInfo !== 'error') {
        var info = req.body.userInfo;
        connection.query('UPDATE user set name=?,birthday=?,free_time_1=?,free_time_2=? where uid=?',
        [info.name, info.birthday, info.free_time_1, info.free_time_2, userInfo.uid], (err) => {
          if(err) {
            res.send('error');
          } else {
            connection.query('SELECT * from ISA where uid=?',
            [userInfo.uid], (err, rows, fields) => {
              var role = rows[0].role;
              var id = rows[0].rid;
              if(role == 'player') { // 因为每个表的数据段不同，需要判断并分别进行插入
                connection.query('UPDATE player set sex=? where rid=?',
                [info.sex, id], (err) => {
                  if(err) {res.send('error');} else {res.status(200).send('ok');}                
                });                    
              } else if(role == 'referee') {
                  connection.query('UPDATE referee set sex=?,price=? where rid=?',
                  [info.sex, info.price, id], (err) => { if(err) { res.send('error');} 
                  else { res.status(200).send('ok');} });  
              } else if(role == 'team') {
                  connection.query('UPDATE team set motto=? where rid=?',
                  [info.motto, id], (err) => { if(err) { res.send('error');} 
                  else { res.status(200).send('ok');} });                     
              }
            });              
          }       
        }); 
      } else {
        res.send('error');
      }
    })
  }
});

module.exports = router;
