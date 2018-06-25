var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  port: 3307,
  insecureAuth : true,
});

connection.query('create database BallHub',
function(err, rows, fields) {
  if(err)
    console.log(err);
  else {
    connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'BallHub',
      port: 3307,
      insecureAuth : true,
    });   
    connection.query('create table user(uid int not null auto_increment,\
                      username char(20) not null,\
                      password char(20) not null,\
                      name char(10),\
                      birthday char(10),\
                      free_time_1 char(5),\
                      free_time_2 char(10),\
                      constraint UserId primary key(uid))CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table ISA(uid int not null,\
                      role char(10) not null,\
                      foreign key(uid) references user(uid)\
                      on delete cascade \
                      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table player(uid int not null,\
                      sex char(10),\
                      primary key(uid),\
                      foreign key(uid) references user(uid)\
                      on delete cascade \
                      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table referee(uid int not null,\
                      sex char(10),\
                      price int(10),\
                      primary key(uid),\
                      foreign key(uid) references user(uid)\
                      on delete cascade \
                      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table team(uid int not null,\
                      motto char(30),\
                      primary key(uid),\
                      foreign key(uid) references user(uid)\
                      on delete cascade \
                      on update cascade)CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table game(gid int not null auto_increment,\
                      primary key(gid),\
                      start_time char(20),\
                      end_time char(20),\
                      type char(10),\
                      number int)CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table attend(uid int not null,\
                      gid int not null,\
                      role char(10) not null,\
                      primary key(uid,gid),\
                      foreign key(uid) references user(uid)\
                      on delete cascade \
                      on update cascade,\
                      foreign key(gid) references game(gid)\
                      on delete cascade \
                      on update cascade)CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.end();
  }
});
connection.end();