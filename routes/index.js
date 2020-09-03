var express = require('express');
var router = express.Router();
//var mailer = require('./mailer');
const db = require('./dbconfig');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { currentUser: '' });
});
router.get('/login',(request,response)=>{
   let username = '',password ='';
   if(request.cookies.username)
     username = request.cookies.username;
   if(request.cookies.password)
     password = request.cookies.password;

   response.render('login',{message: '',currentUser:'',username: username,password: password});
});
router.post('/login',(request,response)=>{
  //console.log(request.body);
  let rememberme = false;
  if(request.body.rememberme){
    rememberme = true;
    delete request.body.rememberme;  
  }
  db.collection('admin').find(request.body).toArray((err,result)=>{
      if(!result.length)
        response.render('error');
      else{
        if(rememberme){
          response.cookie('username',request.body.username);
          response.cookie('password',request.body.password);
          response.send();
        }
        request.session.current_user = result[0].username;
        request.session.save();
        response.redirect('/admin');
      }  
   });
});
router.get('/register',(request,response)=>{
  response.render('register',{message: '',currentUser: ''});
});
router.post('/register',(request,response)=>{
  //request.body.verify = "false";
  db.collection('admin').insert(request.body,(err,result)=>{
      response.render('login',{currentUser:'',message:'Registeration succesfull, now login',username: '',password:''});

  });
});
/*router.get('/verify_account',(request,response)=>{
   db.collection('admin').update({
     username: request.query.username
   },{
     $set: {verify:"true"}
   },(err)=>{
     err ? response.render('error') : response.render('login',{currentUser:'',message:'Account is verified . please login'});
   })
});*/
module.exports = router;
