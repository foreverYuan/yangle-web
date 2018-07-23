import router from './router'
import store from './store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'

// permissiom judge
function hasPermission(roles, permissionRoles) {
  // admin权限 直接通过
  if (roles.indexOf('admin') >= 0) return true
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

// 不重定向白名单
const whiteList = ['/login', '/authredirect']

router.beforeEach((to, from, next) => {
  // 开启Progress
  NProgress.start()
  // 判断是否有token
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      // router在hash模式下 手动改变hash 重定向回来 不会触发afterEach 暂时hack方案 ps：history模式下无问题，可删除该行！
      NProgress.done()
    } else {
      // 判断当前用户是否已拉取完user_info信息
      if (store.getters.roles.length === 0) {
        // 拉取user_info
        store.dispatch('GetUserInfo').then(res => {
          const roles = res.data.role
          // 生成可访问的路由表
          store.dispatch('GenerateRoutes', { roles }).then(() => {
            // 动态添加可访问路由表
            router.addRoutes(store.getters.addRouters)
            // hack方法 确保addRoutes已完成 ,replace: true so the navigation will not leave a history record
            next({ ...to, replace: true })
          })
        }).catch(() => {
          store.dispatch('FedLogOut').then(() => {
            Message.error('验证失败,请重新登录')
            next({ path: '/login' })
          })
        })
      } else {
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        if (hasPermission(store.getters.roles, to.meta.role)) {
          next()
        } else {
          next({ path: '/401', query: { noGoBack: true } })
          // router在hash模式下 手动改变hash 重定向回来 不会触发afterEach 暂时hack方案 ps：history模式下无问题，可删除该行！
          NProgress.done()
        }
        // 可删 ↑
      }
    }
  } else {
    // 在免登录白名单，直接进入
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // 否则全部重定向到登录页
      next('/login')
      // router在hash模式下 手动改变hash 重定向回来 不会触发afterEach 暂时hack方案 ps：history模式下无问题，可删除该行！
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 结束Progress
  NProgress.done()
})
