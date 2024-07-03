var express = require('express');
var router = express.Router();
const UserInfo = require('../models/User')
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/login', function(req, res, next) {
  console.log(req.cookies.token);
});

router.post('/login', function(req, res, next) {
  let userid = req.body.user;
  let pwd = req.body.pwd;

  UserInfo.findOne({username:userid}).select('password').exec(function(err, user){
    if(err) return done(err);
    //cs!t8932
    
    if(user && user.authenticate(pwd)){
      UserInfo.findOne({username:userid}).exec(function(err, user2){
        let userinfo = {};
        userinfo.userId = user2.username;
        userinfo.userName = user2.name;
        userinfo.email = user2.email;

        const token = jwt.sign({
                        userId : user2.username,
                        userName : user2.name,
                        email : user2.email
                      }, pwd, {
                        expiresIn : "1m"
                      })
        
        userinfo.token = token;

        res.status(200).send(userinfo);
      });
      //return done(null, user);
    }else{
      res.status(400).send(null);
      //return done(null, false);
    }
    //res.send({users:users});
  });
  //res.send('respond with a resource');
});

module.exports = router;
