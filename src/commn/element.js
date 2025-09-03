/**
 * Created by DingLiangLiang on 2020/4/9.
 */
'use strict'
import i18n from "@/commn/i18n"

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

export default {
    install: function (Vue) {
        Vue.use(ElementUI, {
            i18n: (key, value) => i18n.t(key, value)
        })
    }
}