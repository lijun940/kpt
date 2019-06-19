var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');//请求网页logo
var cookieParser = require('cookie-parser');//解析cookie
var logger = require('morgan');//日志中间件
var bodyParser = require('body-parser');//对post请求的请求体进行解析

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var session=require('express-session');
app.use(session({
	secret:'blog',//secret:用于对sessionID的cookie进行签名，可以是一个string(一个secret)或者数组(多个secret)。如果指定了一个数组那么只会用 第一个元素对sessionID的cookie进行签       名，其他的用于验证请求中的签名。
	cookie:{maxAge:1000*60*24*30},
	resave:false,//  resave:强制session保存到session store中。
	saveUninitialized:true//  saveUninitialized:强制没有“初始化”的session保存到storage中，没有初始化的session指的是：刚被创建没有被修改 
          //如果是要实现登陆的session那么最好设置为false(reducing server storage usage, or complying with laws that require permission before setting a cookie) 
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));//绝对路劲，设置view视图文件夹的位置
app.set('view engine', 'ejs');//设置项目使用ejs模板引擎

app.use(logger('dev'));//使用日志记录中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//使用express默认的static中间件设置静态资源文件夹的位置

app.use('/', index);//使用路由index
app.use('/users', users);//使用路由users

// catch 404 and forward to error handler


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);//渲染错误请求页面
  res.render('error');
});//设置本地错误信息仅在开发环境中提供
app.listen(3000,function(){
	console.log('listening port 3000');
});
app.use(function(req, res, next) {
	
var err = new Error('Not Found');
err.status = 404;
next(err);
});

module.exports = app;
