// 在Cloud code里初始化express框架
var express = require('express');
var app = express();
var avosExpressCookieSession=require('avos-express-cookie-session');
var expressLayouts=require('express-ejs-layouts');
// App全局配置

app.set('views','cloud/views');   //设置模板目录
app.set('view engine','ejs');    // 设置template引擎
app.set('layout','layout');
app.use(expressLayouts);
app.use(express.bodyParser());    // 读取请求body的中间件
app.use(express.cookieParser('manny is cool'));
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }}));
app.use(avosExpressCookieSession({fetchUser:true}));
app.use(function(req,res,next){
	res.locals.vary=AV.User.current();
	next();
});
app.use(app.router);



app.get('/',function(req,res){
	var Post=AV.Object.extend("Post");
	var query=new AV.Query(Post);
	query.notEqualTo('user',"");
	query.limit(9);
	query.find({
		success:function(results){
			res.render('index',{
				title:"index",
				posts:results

			});
			
		},
		error:function(error){
			console.log('error occur');
		}
	});
});
app.get('/login',function(req,res){
	res.render('login',{
		title:'login'
	});
});
app.get('/reg',function(req,res){//
	res.render('reg',{
		title:'register'
	});
});
app.post('/reg',function(req,res){
	var password=req.body['inputPassword'];
	var username=req.body['inputUsername'];
	var user=new AV.User();
	user.set("username",username);
	user.set('password',password);
	user.signUp(null,{
		success:function(user){
		AV.User.logIn(username,password).then(function(){
		console.log('signin successfully: %j', AV.User.current());
      	res.redirect('/');
	},function(error){
		res.redirect('/login');
	});
		},
		error:function(user,error){}
	});
	
});
app.post('/login',function(req,res){
	AV.User.logIn(req.body['inputUsername'],req.body['inputPassword']).then(function(){
		console.log('signin successfully: %j', AV.User.current());
		res.redirect('/');
	},function(error){
		res.redirect('login');
	});
});
app.get('/logout',function(req,res){
	AV.User.logOut();
    res.redirect('/');
});
app.post('/post',function(req,res){
	var currentUser=AV.User.current();
	var Post=AV.Object.extend("Post");
	var post=new Post();
	post.set("user",currentUser.getUsername());
	post.set("body",req.body["post"]);
	post.save(null,{
		success:function(post)
		{
			res.redirect('/u/'+currentUser.getUsername());
		},
		error:function(post,error)
		{
			console.log("error");
		}
	});
});
app.get('/u/:user',function(req,res){
	var currentUser=AV.User.current();
	if(!currentUser)
	{
		return res.redirect('/');
	}
	var Post=AV.Object.extend("Post");
	var query=new AV.Query(Post);
	query.equalTo("user",currentUser.getUsername());
	query.find({
		success:function(results){
			res.render('user',{
				title:currentUser.getUsername(),
				posts:results

			});
			
		},
		error:function(error){
			console.log('error occur');
		}
	});
	
});
//最后，必须有这行代码来使express响应http请求
app.listen();
console.log('Listening port:3000');