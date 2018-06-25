# BallHub-DBService

## BallHub 服务端

前置安装

+ node
+ npm
+ mysql
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
推荐使用可视化工具 MySQL Workbench查看数据(数据库端口为3307),而不是终端查看 
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