var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
var addCourt = require('./routes/addCourt');
var deleteUser = require('./routes/deleteUser');
var getAllCourt = require('./routes/getAllCourt');
var getAllGame = require('./routes/getAllGame');
var getLoginInfo = require('./routes/getLoginInfo');
var getMyCourt = require('./routes/getMyCourt');
var getMyGame = require('./routes/getMyGame');
var joinGame = require('./routes/joinGame');
var login = require('./routes/login');
var logout = require('./routes/logout');
var organizeGame = require('./routes/organizeGame');
var quitGame = require('./routes/quitGame');
var register = require('./routes/register');
var updateLoginInfo = require('./routes/updateLoginInfo');
var updatePassword = require('./routes/updatePassword');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use('/', indexRouter);
app.use('/api/addCourt',addCourt);
app.use('/api/deleteUser',deleteUser);
app.use('/api/getAllCourt', getAllCourt);
app.use('/api/getAllGame', getAllGame);
app.use('/api/getUserInfo', getLoginInfo);
app.use('/api/getMyGame',getMyGame);
app.use('/api/joinGame',joinGame);
app.use('/api/login', login);
app.use('/api/logout', logout);
app.use('/api/organizeGame',organizeGame);
app.use('/api/quitGame',quitGame);
app.use('/api/register', register);
app.use('/api/updateLoginInfo', updateLoginInfo);
app.use('/api/updatePassword',updatePassword);
app.use('/api/getMyCourt', getMyCourt);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
