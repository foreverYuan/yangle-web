import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    role: ['admin','editor']     will control the page role (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if fasle ,the page will no be cached(default is false)
  }
 **/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/authredirect', component: _import('login/authredirect'), hidden: true },
  { path: '/404', component: _import('errorPage/404'), hidden: true },
  { path: '/401', component: _import('errorPage/401'), hidden: true },
  { path: '/print', component: _import('fetal_heart/print'), hidden: true },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    meta: { title: '胎心监测列表' },
    hidden: true,
    children: [{
      path: 'dashboard',
      component: _import('fetal_heart/list')
    }]
  }
]

export default new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
 
  {
    path: '/fetal_heart',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'fetalHeart',
        component: _import('fetal_heart/list'),
        meta: { title: '胎心监测列表', icon: 'example'  }
      }
    ]
  } ,
    {
    path: '/accept_notice',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'acceptNotice',
        component: _import('accept_notice/list'),
        meta: { title: '接到通知', icon: 'example'  }
      }
    ]
  } ,
  {
    path: '/sys_log',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'sysLog',
        component: _import('sys_log/list'),
        meta: { title: '操作日志', icon: 'example'  }
      }
    ]
  } ,
  { path: '*', redirect: '/404', hidden: true }
]
