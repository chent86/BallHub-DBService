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
    //free_time_1: 星期的缩写 Mon Tue Wed Thu Fri Sat Sun
    //free_time_2: 一天的时间 morning afternoon evening
    connection.query('create table user(uid int not null auto_increment,\
      username char(20) not null,\
      password char(20) not null,\
      name char(10),\
      birthday char(10),\
      free_time_1 char(5),\
      free_time_2 char(10),\
      primary key(uid),\
      unique key(username))CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table ISA(uid int not null,\
      rid int not null auto_increment,\
      primary key(rid),\
      role char(10) not null,\
      foreign key(uid) references user(uid)\
      on delete cascade \
      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table player(rid int not null,\
      sex char(10),\
      primary key(rid),\
      foreign key(rid) references ISA(rid)\
      on delete cascade \
      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table referee(rid int not null,\
      sex char(10),\
      price int(10),\
      primary key(rid),\
      foreign key(rid) references ISA(rid)\
      on delete cascade \
      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table team(rid int not null,\
      motto char(30),\
      primary key(rid),\
      foreign key(rid) references ISA(rid)\
      on delete cascade \
      on update cascade)CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table game(gid int not null auto_increment,\
      primary key(gid),\
      start_time char(20) not null,\
      end_time char(20) not null,\
      type char(10) not null,\
      number int not null,\
      valid int default 1)CHARSET=utf8;',
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
    connection.query('create table court(cid int not null auto_increment,\
      creator int not null,\
      location char(100),\
      type char(10),\
      price int(10),\
      link int(200),\
      primary key(cid))CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table locate(gid int not null,\
      cid int not null,\
      primary key(gid,cid),\
      foreign key(gid) references game(gid)\
      on delete cascade\
      on update cascade,\
      foreign key(cid) references court(cid)\
      on delete cascade\
      on update cascade);',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
    connection.query('create table mail(mid int not null auto_increment,\
      primary key(mid),\
      gid int not null,\
      foreign key(gid) references game(gid)\
      on update cascade\
      on delete no action,\
      sender char(10) not null, \
      message char(100) not null,\
      type char(10) not null)CHARSET=utf8;',
              function(err, rows, fields) {
                  if(err) {
                    console.log(err);
                  }
              });
      connection.query('create table receive(uid int not null,\
        mid int not null,\
        primary key(uid,mid),\
        foreign key(uid) references user(uid)\
        on delete cascade\
        on update cascade,\
        foreign key(mid) references mail(mid)\
        on delete cascade\
        on update cascade);',
                function(err, rows, fields) {
                    if(err) {
                      console.log(err);
                    }
                });
      connection.query('create table result(rid int not null auto_increment,\
        primary key(rid),\
        data char(200))CHARSET=utf8;',
                function(err, rows, fields) {
                    if(err) {
                      console.log(err);
                    }
                });
      connection.query('create table record(gid int not null,\
        rid int not null,\
        primary key(gid,rid),\
        foreign key(gid) references game(gid)\
        on delete cascade\
        on update cascade,\
        foreign key(rid) references result(rid)\
        on delete cascade\
        on update cascade);',
                function(err, rows, fields) {
                    if(err) {
                      console.log(err);
                    }
                });
    connection.end();
  }
});
connection.end();