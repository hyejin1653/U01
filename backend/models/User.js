// models/User.js

var path = require('path');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// schema : require 에 true 대신 배열([ ...])이 들어 갔습니다. 첫번째는 true/false 값이고, 두번째는 에러메세지입니다. 그냥 true/false을 넣을 경우 기본 에러메세지가 나오고, 위와 같이 배열을 사용해서 에러메세지 내용을 원하는 대로 변경할 수 있습니다.
// password에는 select:false 가 추가되었습니다. select:false 로 설정하면 DB에서 해당 모델을 읽어 올때 해당 항목값을 읽어오지 않습니다. 비밀번호는 중요하기 때문에 DB에서 값을 읽어오지 않게 설정했습니다.
// 물론 이 값이 필요한 경우도 있는데, 이럴 때는 해당 값을 읽어오도록 특별히 설정을 해주어야 합니다. 이 설정은 route 코드에서 설명합니다.
var userSchema = mongoose.Schema({
	username:{
		type:String,
		require:[true,'Username is required!'],
		match:[/^.{4,12}$/,'Should be 4-12 characters!'],
		trim:true,
		unique:true
	},
	password:{
		type:String,
		require:[true,'Password is required!'],
		select:false
	},
	name:{
		type:String,
		required:[true,'Name is required!'],
		match:[/^.{4,12}$/,'Should be 4-12 characters!'],	// "문자열의 시작 위치에 길이 4 이상 12 이하인 문자열이 있고, 바로 다음이 문자열의 끝어여야 함"
		trim:true
	},
	email:{
		type:String,
		match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],	// 이메일 형식
		trim:true
	}
},{
toObject:{virtual:true}
});

// virtuals
// DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만든입니다. 즉 passwordConfirmation, originalPassword, currentPassword, newPassword 는 회원가입, 회원정보 수정을 위해 필요한 항목이지만 DB에 저장할 필요는 없는 값들입니다.
userSchema.virtual('passwordConfirmation')
	.get(function(){ return this._passwordConfirmation; })
	.set(function(value){ this._passwordConfirmation=value; });
	
userSchema.virtual('originalPassword')
	.get(function(){ return this._originalPassword; })
	.set(function(value){ this._originalPassword=value; });
	
userSchema.virtual('currentPassword')
	.get(function(){ return this._currentPassword; })
	.set(function(value){ this._currentPassword=value; });
	
userSchema.virtual('newPassword')
	.get(function(){ return this._newPassword; })
	.set(function(value){ this._newPassword=value; });
	
// password validation
// password를 DB에 생성, 수정하기 전에 값이 유효한지 확인을 하는 코드를 작성합니다.
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;	// 8-16자리 문자열 중에 숫자랑 영문자가 반드시 하나 이상 존재해야 한다는 뜻
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';	// 에러 메세지
userSchema.path('password').validate(function(v) {
	var user = this;	// validation callback 함수 속에서 this 는 user model 입니다. 헷갈리지 않도록 user 변수에 넣었습니다.
	
	// create user
	// model.isNew 항목은 해당 모델이 생성되는 경우에는 true, 아니면 false의 값을 가집니다. 이 항목을 이용해서 현재 password validation이 '회원가입'단계인지, 아니면 '회원 정보 수정'단계인지를 알 수 있습니다.
	// 회원가입의 경우 password confirmation 값이 없는 경우와, password 값이 password confirmation 값과 다른 경우에 유효하지 않음 처리(invalidate)를 하게 됩니다.
	// model.invalidate 함수를 사용하며, 첫번째는 인자로 항목 이름, 두번째 인자로 에러메세지를 받습니다.
	if(user.isNew){
		if(!user.passwordConfirmation){
			user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
		}
		
		/*
		if(!passwordRegex.test(user.password)){	// 정규표현식을 통과한다면 true, 그렇지 않다면 false
			user.invalidate('password', passwordRegexErrorMessage);
		}
		*/

		if(user.password !== user.passwordConfirmation) {
			user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
		}
	}
	
	// update user
	// 회원정보 수정의 경우 current password 값이 없는 경우와, current password 값이 original password값과 다른 경우, new password 값과 password confirmation 값이 다른 경우 invalidate합니다.
	// 회원정보 수정시에는 항상 비밀번호를 수정하는 것이 아니기 때문에 new password와 password confirmation 값이 없어도 에러는 아닙니다.
	if(!user.isNew){
		if(!user.currentPassword){
			user.invalidate('currentPassword', 'Current Password is required!');
		}
		else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
			// bcrypt의 compareSync 함수를 사용해서 저장된 hash와 입력받은 password의 hash가 일치하는지 확인합니다.
			// bcrypt.compareSync(user.currentPassword, user.originalPassword) 에서 user.currentPassword는 입력받은 text값이고 user.originalPassword는 user의 password hash 값입니다.
			// hash를 해독해서 text를 비교하는 것이 아니라, text 값을 hash로 만들고 그 값이 일치하는 지를 확인하는 과정입니다.
			user.invalidate('currentPassword', 'Current Password is invalid!');
		}
		
		if(user.newPassword && !passwordRegex.test(user.newPassword)){
			user.invalidate('newPassword', passwordRegexErrorMessage);
		}
		else if(user.newPassword !== user.passwordConfirmation) {
			user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
		}
	}
});

// hash password
// Schema.pre 함수는 첫번째 파라미터로 설정된 이벤트가 일어나기 전에 먼저 callback 함수를 실행시킵니다.
// "save" 이벤트는 Model.create, Model.save 함수 실행시 발생하는 event 입니다.
// 즉 user를 생성하거나 user를 수정한 뒤 save 함수를 실행 할 때 위의 callback 함수가 먼저 호출됩니다.
userSchema.pre('save', function(next){
	var user = this;
	if(!user.isModified('password')){	// isModified 함수는 해당 값이 DB에 기록된 값과 비교해서 변경된 경우 true를 , 그렇지 않은 경우 false를 반환하는 함수이다. user 생성 시는 항상 true이며, user 수정 시는 password가 변경되는 경우에만 true를 반환합니다.
	// user.password의 변경이 없는 경우라면 이미 해당위치에 hash가 저장되어 있으므로 다시 hash를 만들지 않습니다.
		return next();
	}
	else {
		user.password = bcrypt.hashSync(user.password);	// user를 생성하거나 user 수정 시 user.password의 변경이 있는 경우에는 bcrypt 함수로 password를 hash 값으로 바꿉니다.
		return next();
	}
});

// model methods
// user model의 password hash와 입력받은 password text를 비교하는 method를 추가합니다. 이번 예제에 사용되는 method는 아니고 나중에 로그인을 만들 때 사용할 method인데 bcrypt를 사용하므로 지금 추가해 봤음
userSchema.methods.authenticate = function(password) {
	var user = this;
	return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('users',userSchema);
module.exports = User;
