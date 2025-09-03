/**
 * Created by DingLiangLiang on 2020/4/9.
 */
'use strict'
import i18n from "@/commn/i18n"

import XEUtils from 'xe-utils'
import VXEUtils from 'vxe-utils'
import VXETable from 'vxe-table'
import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx'
// import 'vxe-table/lib/index.css' //vxe-table

VXETable.setup({
    zIndex:9999,
    autoResize:true
})
VXETable.use(VXETablePluginExportXLSX)
export default {
    install: function (Vue) {
        Vue.use(VXEUtils, XEUtils)//VXETable依赖

        Vue.use(VXETable, {
            // 对组件内置的提示语进行国际化翻译
            i18n: key => i18n.t(key)
        })
    }
}