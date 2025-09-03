/**
 * 将基本服务注册为扩展方法
 */
'use strict'

import localData from './localData'
import api from './api'
import msgHub from './msgHub'
import show from './messageBox'

export default {
    install: function (Vue) {

        Vue.prototype.$api = api
        Vue.prototype.$msg = msgHub
        Vue.prototype.$storage = localData
        Vue.prototype.$show = show
    }
}


