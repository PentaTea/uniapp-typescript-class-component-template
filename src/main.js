import 'reflect-metadata'

import Vue from 'vue'
import App from './App'

//#ifdef MP-WEIXIN
// import '@app/common/patchVueCompositionApi'
//#endif
import '@app/utils'
import '@app/common/vueFilter'
import '@app/api'
Vue.config.productionTip = false

// import VueCompositionApi from '@vue/composition-api'
// Vue.use(VueCompositionApi)

import VueDataObjectPath from 'vue-data-object-path'
Vue.use(VueDataObjectPath)

import Component from 'vue-class-component'
Component.registerHooks(['setup', 'beforeRouteUpdate', 'beforeRouteEnter', 'beforeRouteLeave'])

//全局组件
// import xxx from '@app/components/xxx'
// Vue.component('xxx', xxx)

new App({}).$mount()
