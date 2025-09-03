/**
 * Created by DingLiangLiang on 2020/4/9.
 */
'use strict'
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// 国际化
const i18n = new VueI18n({
    silentTranslationWarn: true // 去除console中黄色报错
})

export default i18n


