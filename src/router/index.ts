import Vue from 'vue'
import Router from 'vue-router'
import IndexHome from "../views/IndexHome.vue"

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: IndexHome
    }
  ]
})
