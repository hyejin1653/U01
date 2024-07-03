<template>
    <div class="wrap">
        <header id="header">
            <h1 class="logo">
                <v-img alt="GCSC" contain src="../img/GC_Symbol_color.png"  width="5%" height="auto" style="float:left;"/>
                <v-img contain src="../img/BEAD_logo11.png"  width="18%" height="auto"/>
            </h1>
        </header>
        <div id="container">
			<div class="LogInBg">
				<div class="hTxt">
					<h3>통계 분석 시스템</h3>
					<div id="LogInLogo"></div>
				</div>
			</div>
			<!--LogIn Bg-->
			<div class="LogIn" style="margin:0; padding:0;">
				<h2 id="LogInTxt" class="engfont">LOGIN </h2>
                <div id="errorMeg">
                    <v-alert type="error" :value="isLoginError" >
                        아이디와 패스워드를 확인해주세요
                    </v-alert>
                </div>
                <div id="UserName">
                    <v-text-field label="Username" :rules="[rules.user]" v-model="userId" persistent-hint outlined></v-text-field>
                </div>
                <div id="Password">
                    <v-text-field :type="'password'" v-model="passWord" :rules="[rules.pwd]" label="Password" persistent-hint outlined></v-text-field>
                </div>
                <div id="loginBtn">
                    <v-btn color="secondary" x-large depressed block @click="loginIn">
                        <img src="../img/logIn_Icon.png">&nbsp;
                        LOG IN
                    </v-btn>
                </div>
            
			</div>
		</div>
    </div>
    
</template>
<script>
export default {
    name: 'Login',

    data: () => ({
            isLoginError : false,
            userId : 'gcsc',
            passWord : 'cs!t8932',
            rules: {
                        user: value => !!value || 'Username is required!',
                        pwd: value => !!value || 'Password is required!',
                    },
            isLoginFlag : false,
        //
    }),
    methods: {
        loginIn(){
            if(this.userId == null || this.passWord == null) return;
            this.$http.post('/api/users/login', {
                user:this.userId, pwd:this.passWord
            }).then((res) => {
                console.log(res);
                //this.setInfo("성공", res.headers["autoToken"], JSON.stringify(res.data.data))
                //로그인성공
                if(res.status === 200)
                {
                    //state.users = res.data;
                    this.$store.commit("login", res.data);
                    this.$router.push('main');
                }
            }).catch(err => {
                console.log(err);
                //this.isLoginError = true;
            })
        }
    }
};
</script>
<style>
.wrap{
    height:100vh; 
    background:url("../img/bg2.png") no-repeat center; 
    background-size: cover;
    font-family: 'Source Sans Pro', sans-serif; 
}
#header{width: 100%; height: 90px;}
.logo{
    position: absolute; 
    float:left; 
    margin:30px 0 0 30px; 
    width: 700px;
}
#container{ position: relative; top: 0; width:1252px; height: 547px; margin: 20vh auto 0 auto;font-size:12px;}
.LogInBg{position: absolute; width: 50%; height: 100%; background-color:rgba(159,159,159,0.59);}
.hTxt{position: relative; height: 547px; margin: 0 auto;}
.hTxt h3{font-size:2em; color:rgba(255,255,255,1.00); margin-top: 100px; text-align: center; font-weight: 200;}

.engfont{ font-family: 'Source Sans Pro', sans-serif; }
.LogIn{position: absolute; right: 0; width: 50%; height: 100%; background-color: rgba(255,255,255,1.00);}

#LogInTxt{font-size:4em; color:rgba(131,131,131,1.00); margin-top: 100px; text-align: center; font-weight: 300;}
#UserName{width: 500px; height: 50px; margin: 30px auto 0 auto; border-radius: 7px;}
#Password{width: 500px; height: 50px; margin: 20px auto 0 auto; border-radius: 7px;}
#loginBtn{
    text-align: center; 
    width: 350px;
    height: 50px;
    margin: 60px auto 0 auto; 
}
#errorMeg{
    width: 500px;
    height: 60px;
    margin: 20px auto 0 auto;
}
</style>
