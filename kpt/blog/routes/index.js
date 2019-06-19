var express = require('express');
var router = express.Router();
var crypto = require('crypto');//md5加密
var mysql = require('./../database');


/* GET home page. */
router.get('/', function(req, res, next) {
	var query = 'select * from article order by articleID desc';
	mysql.query(query,function(err,rows,fields){
		var articles = rows;
		articles.forEach(function(ele){
			var year = ele.articleTime.getFullYear();
			var month = ele.articleTime.getMonth()+ 1 > 10 ?
ele.articleTime.getMonth() : '0' +(ele.articleTime.getMonth() + 1);
  		var date = ele.articleTime.getDate() > 10 ? ele.articleTime.getDate() :
'0' + ele.articleTime.getData();
			ele.articleTime = year + '-' + month + '-' +date;
		});
		res.render("index",{articles:articles,user:req.session.user});
//		console.log(req.session);
//		格式为{ path: '/',
//   _expires: 2019-06-19T19:30:26.375Z,
//   originalMaxAge: 43200000,
//   httpOnly: true },
//user:
// { authorID: 3,
//   authorName: 'lj2',
//   authorPassword: '2b0196e0c9a71193bec02b43962c7c03' } }
//session存放在哪里：服务器端的内存中。不过session可以通过特殊的方式做持久化管理（memcache，redis）。

//session的id是从哪里来的，sessionID是如何使用的：当客户端第一次请求session对象时候，服务器会为客户端创建一个session，并将通过特殊算法算出一个session的ID，用来标识该session对象
//
//session会因为浏览器的关闭而删除吗？
//
//不会，session只会通过上面提到的方式去关闭。
//	console.log(req.sessionID);
	
	});
});
//定义一个请求方法为get方法的路由，第一个参数是请求的url路径
//渲染一个视图模板，第一个参数是模板引擎文件夹下的视图文件名，第二个参数是传给视图的json数据
router.get('/login',function(req, res, next){
	res.render('login',{message:'',user:req.session.user});
});
router.get('/zc',function(req, res, next){
	res.render('zc');
});
router.post('/zc',function(req, res, next){
	var zh = req.body.zh;
	var mm = req.body.mm;
	var hash = crypto.createHash('md5');
	hash.update(mm);
	mm = hash.digest('hex');
	var query ='insert author set authorID=  default  ,authorName=' + mysql.escape(zh) + ',authorPassword=' + mysql.escape(mm) + '';
	mysql.query(query, function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		
		
		

		res.redirect('/login');
//	console.log(req.body);
//		[Object: null prototype] { name: 'node', password: '123456' }
		
		
		
	});
});
router.post('/login',function(req, res, next){
	var name = req.body.name;
	var password = req.body.password;
	var hash = crypto.createHash('md5');
	hash.update(password);
	password = hash.digest('hex');
	var query = 'SELECT * FROM author WHERE authorName=' + mysql.escape(name) +' AND authorPassword=' + mysql.escape(password);
	mysql.query(query, function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		var user = rows[0];
		
		if(!user){
			res.render('login',{message:'用户名或者密码错误'});
			
			return;
		}
		req.session.user = user;

		res.redirect('/');
//	console.log(req.body);
//		[Object: null prototype] { name: 'node', password: '123456' }
		
		
		
	});
});
router.get('/articles/:articleID',function(req,res,next){
	var articleID=req.params.articleID;//包含映射到指定的路线“参数”属性的对象，这个对象存储着请求时路由配置中占位符的真实内容，占位符使用：开头表示，这里使用的每篇文章的ID
	var query='select * from article where articleID=' + mysql.escape(articleID);
	mysql.query(query,function(err,rows,fields){
		if(err){
			console.log(err);
			return;
		}
		var query = 'update article set articleClick=articleClick+1 where articleID=' + mysql.escape(articleID);
		var article = rows[0];
		mysql.query(query,function(err,rows,fields){
			if(err){
				console.log(err)
				return;
			}
		
		
		var year = article.articleTime.getFullYear();
		var month = article.articleTime.getMonth()+ 1 > 10 ?
article.articleTime.getMonth() : '0' +(article.articleTime.getMonth() + 1);
  		var date = article.articleTime.getDate() > 10 ? article.articleTime.getDate() :
'0' + article.articleTime.getData();
		article.articleTime = year + '-' + month + '-' +date;
		res.render('article',{article:article,user:req.session.user});
	});
});
});
router.get('/edit',function(req, res, next){
	var user = req.session.user;
	if(!user){
		res.redirect('/login');//重定义到path所指定的URL，重定向时可以同时指定HTTP状态码，不指定状态码默认为302
		return;
	}
	res.render('edit',{user:req.session.user});
});
router.post('/edit',function(req, res, next){
	var title = req.body.title;
	var content = req.body.content;
	var author = req.session.user.authorName;
	var query='insert article set articleTitle=' + mysql.escape(title) + ',articleAuthor=' + mysql.escape(author) + ',articleContent=' + mysql.escape(content) + ',articleTime=CURDATE()';
	mysql.query(query,function(err,rows,fields){
		if(err){
			console.log(err);
			return;
		}
		res.redirect('/');
	});
	
});
router.get('/modify/:articleID',function(req,res,next){
	var articleID=req.params.articleID;
	var user = req.session.user;
	var query = 'select * from article where articleID=' + mysql.escape(articleID);
	if(!user){
		res.redirect('/login');
		return ;
	}
	mysql.query(query,function(err,rows,fields){
		if(err){
			console.log(err);
			return;
		}
		var article = rows[0];
		var title = article.articleTitle;
		var content = article.articleContent;
		console.log(title,content);
		res.render('modify',{user:user,title:title,content:content});
	});
});
router.post('/modify/:articleID',function(req,res,next){

	var articleID = req.params.articleID;
	var user = req.session.user;
	var title = req.body.title;
	var content = req.body.content;
	var query = 'update article set articleTitle=' + mysql.escape(title) + ',articleContent=' + mysql.escape(content) +'where articleID=' +mysql.escape(articleID);
	mysql.query(query,function(err,rows,fields){
		if(err){
			console.log(err);
			return;
		}
		res.redirect('/');
	});
	
});
router.get('/friends',function(req,res,next){
	res.render('friends',{user:req.session.user});
});
router.get('/about',function(req,res,next){
	res.render('about',{user:req.session.user});
});
router.get('/logout', function(req,res,next){
	req.session.user = null;
	res.redirect('/');
});

module.exports = router;

