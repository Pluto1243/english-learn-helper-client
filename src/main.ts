import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import service from './utils/axios'
import App from './App.vue'
import router from './router'
import VueRouter from 'vue-router'


Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueRouter)

Vue.prototype.$message = ElementUI.Message;

Vue.prototype.openLoading = function() {
    const loading = this.$loading({           // 声明一个loading对象
        lock: true,                             // 是否锁屏
        text: '正在加载...',                     // 加载动画的文字
        spinner: 'el-icon-loading',             // 引入的loading图标
        background: 'rgba(0, 0, 0, 0.7)',       // 背景颜色
        target: '.sub-main',                    // 需要遮罩的区域
        body: true,
        customClass: 'mask'                     // 遮罩层新增类名
    })
    setTimeout(function () {                  // 设定定时器，超时5S后自动关闭遮罩层，避免请求失败时，遮罩层一直存在的问题
        loading.close();                        // 关闭遮罩层
    },5000)
    return loading;
}

Vue.prototype.$axios = service;

// resize for scaling the board size
window.addEventListener('resize', onResize)
// set size on startup
onResize()

function onResize() {
    // get actual vh on mobile
    document.body.style.setProperty('--vh', window.innerHeight + 'px')
}

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(App)
})
