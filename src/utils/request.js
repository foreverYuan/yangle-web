import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { removeToken } from '@/utils/auth'
import Router from 'vue-router'
import { mapGetters } from 'vuex'

// 创建axios实例
const service = axios.create({
	// baseURL: process.env.BASE_API, // api的base_url
	//baseURL: "https://yl.atersoft.com:8080/yangle", // api的base_url
       baseURL: "http://118.31.66.193/yangle",
//  	    baseURL: "http://192.168.0.109:8080/yangle", // api的base_url
	//baseURL: "http://tx.blawsoft.com:8080/yangle", // api的base_url
	//baseURL: '/api/hwt/',
	timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(config => {
	// Do something before request is sent
	if(store.getters.token) {
		config.headers['token'] = getToken(); // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
	}
	return config
}, error => {
	// Do something with request error
	console.log(error) // for debug
	Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
	response => {
		if(response.data.code == 401) {
			Message({
				message: '您的身份信息已经失效',
				type: 'error',
				duration: 3 * 1000
			})
			// var exp = new Date();
			// exp.setTime(exp.getTime() - 1);
			// var cval=getToken();
			// if(cval!=null)
			// document.cookie= token + "="+cval+";expires="+exp.toGMTString();
			removeToken();
			window.setTimeout("window.location='/#/login'", 3000);
			// this.$router.push({ path: '/login' })
		}

		return response;
	},
	/**
	 * 下面的注释为通过response自定义code来标示请求状态，当code返回如下情况为权限有问题，登出并返回到登录页
	 * 如通过xmlhttprequest 状态码标识 逻辑可写在下面error中
	 */
	//  const res = response.data;
	//     if (res.code !== 20000) {
	//       Message({
	//         message: res.message,
	//         type: 'error',
	//         duration: 5 * 1000
	//       });
	//       // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
	//       if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
	//         MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
	//           confirmButtonText: '重新登录',
	//           cancelButtonText: '取消',
	//           type: 'warning'
	//         }).then(() => {
	//           store.dispatch('FedLogOut').then(() => {
	//             location.reload();// 为了重新实例化vue-router对象 避免bug
	//           });
	//         })
	//       }
	//       return Promise.reject('error');
	//     } else {
	//       return response.data;
	//     }
	error => {
		console.log('err' + error) // for debug
		Message({
			message: error.message,
			type: 'error',
			duration: 5 * 1000
		})
		return Promise.reject(error)
	})

export default service