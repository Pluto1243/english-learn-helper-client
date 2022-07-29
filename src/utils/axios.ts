import axios from 'axios';
import {baseURL} from "./config";
// import {BASE_URL} from "@/config";
//  让请求在浏览器中允许跨域携带cookie
axios.defaults.withCredentials = true;

// 使用自定义配置新建一个 axios 实例
const service= axios.create({
  // 基础的请求地址
  baseURL: baseURL,
  method: "GET",
  // 设置超时时间 5s
  timeout: 5000
});

// 请求拦截器，例如请求的时候在头部加上请求的token
service.interceptors.request.use(config => {

  if (localStorage.getItem('token')) {

    // config.headers.token = localStorage.getItem('token');

  }

  return config;  //  有且必须有一个config对象被返回

}, error => {
  //   对请求错误做些什么
  console.log(error);
  return Promise.reject();
});


// 响应拦截器,例如判断服务器返回的状态，400，500啥的，其实超时可以写到这里面来，我分开写了一个比较直观
service.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return Promise.resolve(response.data);
    } else {
      return Promise.reject(response);
    }
  },
);

export default service;
