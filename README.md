# BallHub-DBService

## BallHub 服务端

前置安装

+ node
+ npm
+ docker
+ docker-compose

环境
> linux(建议)

初始化数据库
```
cd database
sudo docker-compose up (-d : 在后台执行，耗时大概40s)
node init.js (需要等待上一条指令执行完成)
```

建立数据库连接
```
npm start (8000端口)
```

本地终端连接数据库
```
mysql -uroot --protocol=TCP --port=3307 -p
密码为： admin
推荐使用可视化工具 MySQL Workbench查看数据(数据库端口为3307)
```

重新生成数据库
```
sudo docker kill db
sudo docker rm db
sudo docker rmi db-image
sudo docker-compose up
node init.js
node db.js
```

## 数据库表

### user
|列名|类型|特性|
|:-:|:-:|:-:|
|uid|INT|primary key|
|username|CHAR|unique key　用户名|
|password|CHAR|密码|
|name|CHAR|昵称|
|birthday|CHAR|出生日期|
|free_time_1|CHAR|星期简称,如:Mon|
|free_time_2|CHAR|一天内的时间,如:Morning|

### ISA
|列名|类型|特性|
|:-:|:-:|:-:|
|uid|INT|foreign key(指向user)级联删除|
|rid|INT|primary key|
|role|CHAR|角色|

### player
|列名|类型|特性|
|:-:|:-:|:-:|
|rid|INT|primary&&foreign key(指向ISA)级联删除|
|sex|CHAR|性别|

### referee
|列名|类型|特性|
|:-:|:-:|:-:|
|rid|INT|primary&&foreign key(指向ISA)级联删除|
|sex|CHAR|性别|
|price|INT|费用|

### team
|列名|类型|特性|
|:-:|:-:|:-:|
|rid|INT|primary&&foreign key(指向ISA)级联删除|
|motto|CHAR|球队口号|

### game
|列名|类型|特性|
|:-:|:-:|:-:|
|gid|INT|primary key|
|start_time|CHAR|开始时间|
|end_time|CHAR|结束时间|
|type|CHAR|半场或全场|
|number|INT|最大人数|

### attend
|列名|类型|特性|
|:-:|:-:|:-:|
|uid|INT|foreign key(指向user)级联删除|
|gid|INT|foreign key(指向game)级联删除|