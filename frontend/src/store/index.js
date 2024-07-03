import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userId : '',
    userName: '', 
    token: '',
    routeFlag : false
  },
  getters: {
  },
  mutations: {
    login: function (state, payload) { 
        state.userId = payload.userId 
        state.userName = payload.userName 
        state.token = payload.token 
    }, 
    loginCheck: function (state) { 
        if (!state.token) { 
            router.push({ 
                name: 'login' 
            }).catch(error => { 
                console.log(error) 
            }) 
        } 
    },
    changeShow: function(state){
      state.routeFlag = !state.routeFlag;
    }
  },
  actions: {
  },
  modules: {
  }
})
