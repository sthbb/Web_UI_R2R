/**
 *
 *   路由及拦截器, 拦截器主要用于身份验证
 *
 */

import MasterPage from './views/MasterPage'
import Router from "vue-router";
import Axios from "axios";
import local from './service/localData';
import api from './service/api';
import devRouters from '@/devRouters'

//创建路由
const createRouter = () => new Router({
    scrollBehavior: () => ({y: 0}),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/Login')
        },
        {
            path: '/404',
            name: 'e_404',
            component: () => import('@/views/404')
        },
        {path: '*', redirect: '/login'}
    ]
})
const router = createRouter()
//认证拦截器
router.beforeEach((to, from, next) => {
    //认证拦截器, 如果在会话存储中没有找到Token,则认为没有登陆, 自动跳转登录页, 登陆后自动跳转回当前页.
    if (to.path !== '/login') {
        let token = local.token.get();
        if (!token || token === '') {
            next({
                path: '/login',
                // query: {redirect: to.fullPath}  // 将跳转的路由path作为参数，登录成功后跳转到该路由
            })
        } else {
            Axios.defaults.headers.common['Authorization'] = token;
            next();
        }
    } else {
        //当访问Login页面时清空会话存储中的数据
        local.clearSession();
        api.delToken();
        router.matcher = createRouter().matcher;
        next();
    }
})
//Json转路由
let getMainRouter = function (data) {
    if(process.env.NODE_ENV === 'development'){
        // data = data && data.concat(devRouters)
    }
    let childrenPath = [];
    for (let i=0;i< data.length;i++) {
        const hasNoChild = data.findIndex(v=>v.UPPER_MENU_ID === data[i].MENU_ID) === -1
        //必须带有路径(views)及文件名(.vue)，只有这样，webpack打包时才会将vue文件一起打包。
        let component = () => import('@/views/' + data[i].VIEW_URL + '.vue')
        const item = {
            path: data[i].PATH,
            name: data[i].MENU_ID,
            component: component,
            meta: {title: data[i].LABEL_ID}
        }
        hasNoChild && childrenPath.push(item)
    }
    return [{
        path: '/',
        redirect: 'home',
        component: MasterPage,
        children: childrenPath
    }]
}
//登陆后按照当前用户的权限刷新路由
router.refreshRouter = function (data) {
    //清理当前路由
    router.matcher = createRouter().matcher;
    let mainRouter = getMainRouter(data);
    //添加路由
    router.addRoutes(mainRouter);
}
export default router
