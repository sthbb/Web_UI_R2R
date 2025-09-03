import Vue from 'vue'
import Router from 'vue-router'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import '@/styles/index.scss' // global css
import '@/styles/element-ui.scss' // global css
import i18n from './commn/i18n'
import ElementUI from './commn/element'
import VXETable from './commn/vxe-table'
import VEcharts from './commn/echarts'
import IconPicker from './component/IconPicker';//图标选择器
import ExtensionService from './service/extensionService'
import App from './App'
import router from './router'
import local from './service/localData'
import CommonUtils from './commn/commonUtils'
import XLSX from 'xlsx'
import XEUtils from 'xe-utils'
import './assets/icon/iconfont.js'
import './assets/icon/iconfont.css'



//刷新时读取会话存储中的路由表
let user = local.user.get();
//console.log(user)
if (user && user.router) {
    router.refreshRouter(user.router)
}


Vue.use(Router);
Vue.use(ElementUI);
Vue.use(VXETable);
Vue.use(VEcharts);

Vue.use(IconPicker);
Vue.use(ExtensionService);
Vue.use(CommonUtils);
Vue.prototype.XLSX = XLSX;
Vue.prototype.$ueutils = XEUtils
Vue.config.productionTip = false;

new Vue({
    i18n,
    el: '#app',
    router,
    data:()=>{
        return {
            theme:'#00678e'
        }
    },
    render: h => h(App),
    mounted: function () {
        let lang = this.$storage.lang.get();
        if (!lang) {
            lang = this.$api.lang.zh_CN;
            this.$storage.lang.set(lang);
        }
        this.$api.lang.setLanguage(lang, i18n);
    }
})
