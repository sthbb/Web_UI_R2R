/**
 *
 *   API中心, 所有API都应该在这里定义.
 *
 */

import Axios from "axios"
import router from "../router"
import i18n from '../commn/i18n'
import el from 'element-ui'

import enEl from 'element-ui/lib/locale/lang/en'
import cnEl from 'element-ui/lib/locale/lang/zh-CN'
import koEl from 'element-ui/lib/locale/lang/ko'
import cnVX from 'vxe-table/lib/locale/lang/zh-CN'
import enVX from 'vxe-table/lib/locale/lang/en-US'

import storage from './localData'
import api from '@/api/api.ts'

import { requeatParams } from '@/commn/commonFn'

let loadinginstace
Axios.interceptors.request.use(
    config => {
        // element ui Loading方法
        loadinginstace = el.Loading.service({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)',
            customClass: "osloading",
            fullscreen: true
        })
        config.headers['Content-Type'] = 'application/json_web'
        return config
    },
    error => {
        loadinginstace.close()
        el.Notification.error({
            title: i18n.t('v_notice_error'),
            message: i18n.t('v_notice_error_checknetwork ')
        })
        return Promise.reject(error)
    }
)

Axios.interceptors.response.use(
    response => {
        loadinginstace.close()
        // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
        // 否则的话抛出错误
        if(response.config.url === '/theme.scss'){
            return Promise.resolve(response.data)
        }
        if (response.status === 200) {
            if(response.data.RETURN.RETURN_MSG !== 'SUCCESS'){
                el.Notification.error({
                    title: i18n.t('v_notice_error'),
                    message: response.data.RETURN.RETURN_MSG
                })
                return {}
            }else{
                return Promise.resolve(response.data.BODY)
            }
        } else {
            return Promise.reject(response)
        }
    },
    // 服务器状态码不是2开头的的情况
    // 这里可以跟你们的后台开发人员协商好统一的错误状态码
    // 然后根据返回的状态码进行一些操作，例如登录过期提示，错误提示等等
    // 下面列举几个常见的操作，其他需求可自行扩展
    error => {
        loadinginstace.close()

        if (error.response.status) {
            switch (error.response.status) {
                //400 密码错误
                case 400:
                    el.Notification.error({
                        title: i18n.t('v_notice_error'),
                        message: error.response.data ? error.response.data : i18n.t('v_notice_error_400')
                    })
                    break
                // 401: 未登录
                case 401:
                // 403 授权验证失败,多种情况, 如:token过期, 当前接口无授权
                case 403:
                    el.Notification.error({
                        title: i18n.t('v_notice_error'),
                        message: error.response.status === 401 ? i18n.t('v_notice_error_401') : i18n.t('v_notice_error_403')
                    })
                    // 只有在当前路由不是登录页面才跳转
                    router.currentRoute.name !== '/login' &&
                    router.replace({
                        path: 'login',
                        query: {redirect: router.currentRoute.path},
                    })
                    break

                // 404请求不存在
                case 404:
                    el.Notification.error({
                        title: i18n.t('v_notice_error'),
                        message: i18n.t('v_notice_error_404')
                    })
                    break
                case 500:
                    el.Notification.error({
                        title: i18n.t('v_notice_error'),
                        message: i18n.t('v_notice_error_500')
                    })
                    break
                // 其他错误，直接抛出错误提示
                default:
                    console.log(error.response.data)
            }
            return Promise.reject(error.response)
        }
    }
)
let createURL = function (param) {
    let urlTmp = ''
    for (let key in param) {
        urlTmp += ('&' + key + "=" + param[key])
    }
    return urlTmp.substr(1).replace(' ', '')
}

export default {

    setToken(token) {
        //console.log('set token api', token)
        Axios.defaults.headers.common['Authorization'] = token
    },
    delToken() {
        Axios.defaults.headers.common['Authorization'] = ""
    },
    lang: {
        en_US: "EN",
        ko: "KO",
        zh_CN: "CN",
        setEn() {
            this.setLanguage(this.en_US)
        },
        setCn() {
            this.setLanguage(this.zh_CN)
        },
        setKo() {
            this.setLanguage(this.ko)
        },
        setLanguage(lang) {
            let other = {}
            let filterData = {}
            switch (lang) {
                case this.en_US:
                    other = Object.assign(enVX, enEl)
                    break
                case this.ko:
                    other = Object.assign(enVX, koEl)//xeTable暂时没有韩语语言包，用英语代替
                    break
                case this.zh_CN:
                default:
                    other = Object.assign(cnVX, cnEl)
                    break
            }

            let param = {"LANG": lang}
            const data = requeatParams(param,'WEBI18N_MANAGEMENT#select')

            Axios.post(api.serverUrl, data).then(response => {
                (response.DATA || []).forEach(v=>{
                    filterData[v.LANG_KEY] = v[lang]
                })
                i18n.setLocaleMessage(lang, Object.assign(filterData, other))
                i18n.locale = lang
                storage.lang.set(lang)
            })

            // Axios.get('/SystemManagement/GetI18nByLang?lang=' + lang)
            //     .then(response => {
            //         console.log(Object.assign(response.data, other))
            //         i18n.setLocaleMessage(lang, Object.assign(response.data, other))
            //         i18n.locale = lang
            //         storage.lang.set(lang)
            //     })
        },
    },

    commn: {
        login(uid, pwd) {
            const params = requeatParams({USER_ID: uid,PASSWORD:pwd},'USERS_MANAGEMENT#login')
            return Axios.post(api.serverUrl, params)
        },
        // 获取col_map
        getColMap(row) {
            const data = requeatParams(row,'COLMAP_MANAGEMENT#select')
            return Axios.post(api.serverUrl, data)
        },
    },
    systemManagement: {
        getCurrentProcessID() {
            const data = requeatParams({},'USERS_MANAGEMENT#getCurrentProcessID')
            return Axios.post(api.serverUrl, data)
            // return Axios.get('/SystemManagement/GetCurrentProcessID')
        },
        getMenu(row) {
            const data = requeatParams(row,'MENU_MANAGEMENT#select')
            return Axios.post(api.serverUrl, data)
        }
    },
    Service: {
        getAllServiceList() {
            return Axios.get('/get_all_list', {baseURL: "service/"})
        },
        stopService(name) {
            return Axios.get('/stop?name=' + name, {baseURL: "service/"})
        },
        startService(name) {
            return Axios.get('/start?name=' + name, {baseURL: "service/"})
        },
        reloadService() {
            return Axios.post('/reload', {}, {baseURL: "service/"})
        },
        delService(name) {
            return Axios.delete('/del?name=' + name, {baseURL: "service/"})
        },
        addService(obj) {
            let o = {
                name: obj.name,
                command: obj.command,
                environ: obj.environ,
                dir: obj.directory,
                user: obj.user,
                retries: obj.startRetries
            }
            let par = createURL(o)
            return Axios.post('/add', par, {
                baseURL: "service/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': '*/*'
                }
            })
        },
        updateService(obj) {
            obj.environ = obj.environ.split(',')
            return Axios.put('/update?name=' + obj.name, obj, {baseURL: "service/"})
        },
        getServiceInfo(name) {
            return Axios.get('/get_info?name=' + name, {baseURL: "service/"})
        },
    },
    parameter:{
        modelParaList(row,ServiceID){
            const data = requeatParams(row,ServiceID.trim())
            return Axios.post(api.serverUrl, data)
        }
    }
}


