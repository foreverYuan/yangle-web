import Vue from 'vue'


import 'normalize.css/normalize.css'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'


import '@/styles/index.scss'

import App from './App'
import router from './router'
import store from './store'

import './icons'
import './errorLog'
import './permission'
import './mock'

import * as filters from './filters'

import VueContextMenu from 'vue-contextmenu'
 
Vue.use(VueContextMenu)

Vue.use(Element, {
  size: 'medium',
  locale
})


Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
})

import config from './utils/config.js'
Vue.prototype.CONFIG = config