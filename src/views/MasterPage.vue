<template>
    <div class="wrapper">
        <!-- :style="{ backgroundImage: `linear-gradient(180deg, ${$root.theme} 0%, #034e73 100%)` }" -->
        <div class="header" :style="{ background: $root.theme }">
            <!-- 折叠按钮 -->
            <div class="collapse-btn" @click="collapseChage">
                <i class="el-icon-menu"></i>
            </div>
            <div class="logo"><img src="../assets/logo.png" alt=""></div>
            <div class="des">
                {{$t('v_master_page_master_title')}}
            </div>
            <div class="header-right">
                <div class="header-right-con">
                    <!-- 全屏显示 -->
                    <div class="btn-fullscreen" @click="handleFullScreen">
                        <el-tooltip effect="dark" :content="fullscreen? $t('v_master_page_master_exit_fullscreen'):$t('v_master_page_master_fullscreen') " placement="bottom">
                            <i class="el-icon-rank"></i>
                        </el-tooltip>
                    </div>
                    <!-- 用户头像 -->
                    <div class="user-avator">
                        <i class="el-icon-user-solid"/>
                    </div>
                    <!-- 用户名下拉菜单 -->
                    <el-dropdown class="user-info m-r-10" trigger="click" @command="handleCommand">
                        <span class="el-dropdown-link">
                            {{username}}
                            <!-- <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-quanxianyonghu"></use>
                            </svg> -->
                            <i class="el-icon-caret-bottom"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown" class="el-dropdown">
                            <!--红光不需要用户管理-->
                            <el-dropdown-item divided command="themePicker">{{$t('v_master_page_change_theme')}}</el-dropdown-item>
                            <el-dropdown-item divided command="password">{{$t('v_master_page_master_changepwd')}}</el-dropdown-item>
                            <el-dropdown-item divided command="cn">{{$t('v_master_page_switch_cn')}}</el-dropdown-item>
                            <el-dropdown-item divided command="en">{{$t('v_master_page_switch_en')}}</el-dropdown-item>
                            <el-dropdown-item divided command="loginout">{{$t('v_master_page_master_logout')}}</el-dropdown-item>
                            <!-- <el-dropdown-item divided command="ko">切换韩语</el-dropdown-item> -->
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>
        <div class="sidebar" :style="{ background: $root.theme }">
            <!--左侧菜单 start    *********************************************************************-->
            <el-menu class="sidebar-el-menu" :collapse="collapse"  unique-opened="" router="" :default-active="onRoutes">
                <div v-for="menu in menus" :key="menu.ID">
                    <template v-if="menu.subs && menu.subs.length>0">
                        <el-submenu :index="menu.MENU_ID+''" :key="menu.ID">
                            <template slot="title">
                                <i :class="menu.MENU_ICON"></i>
                                <span>{{$t(menu.LABEL_ID)}}</span>

                            </template>
                            <template>
                                <el-menu-item :index="subMenu.MENU_ID+''" :route="subMenu.PATH"  v-for="subMenu in menu.subs" :key="subMenu.ID">
                                    <i :class="subMenu.MENU_ICON"></i>
                                    <span>{{ $t(subMenu.LABEL_ID) }}</span>
                                </el-menu-item>
                            </template>
                        </el-submenu>
                    </template>
                    <!--无二级菜单时-->
                    <template v-else>
                        <el-menu-item :index="menu.id+''" :route="menu.PATH">
                            <i :class="menu.MENU_ICON"></i>
                            <span>{{ $t(menu.LABEL_ID) }}</span>
                        </el-menu-item>
                    </template>
                </div>
            </el-menu>
            <!--左侧菜单 end    *********************************************************************-->
        </div>
        <div class="content-box" :class="{'content-collapse':collapse}">
            <v-tags></v-tags>
            <!--内容 start    *********************************************************************-->
            <div class="content">
                <section :class="['app-main theme-main']">
                    <transition name="fade-transform" mode="out-in">
                        <template v-if="isDebug">
                            <router-view :key="key"/>
                        </template>
                        <keep-alive v-else>
                            <router-view :key="key"/>
                        </keep-alive>
                    </transition>
                </section>
            </div>
            <!--内容 end    *********************************************************************-->
        </div>
        <el-dialog
            :visible.sync="showPassword"
            width="30%"
            :append-to-body="true"
            :before-close="()=>{cancelPassord()}"
            >
            <span slot="title">
                <div class="diolag-box" :style="{background:$root.theme}">
                    <div>{{isThemePicker ? $t('v_master_page_change_system_theme') : $t('v_master_page_master_changepwd')}}</div>
                </div>
            </span>
            <ThemePicker v-if="isThemePicker" ref="themeForm" :themeColor="$root.theme"/>
            <EditPassword :ruleForm="passwordData" ref="addForm" v-else/>
            <span slot="footer">
                <el-button @click="cancelPassord()">{{$t('btn_cancel')}}</el-button>
                <el-button type="primary" @click="confirmPassord()">{{$t('btn_confirm')}}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
const ORIGINAL_THEME = '#409EFF' // default color
const version = require('element-ui/package.json').version // element-ui version from node_modules
    import VTags from '../component/VTags'
    import EditPassword from './Admin/component/EditPassword'
    import ThemePicker from '@/component/ThemePicker'
    import Axios from "axios"
    export default {
        name: "masterPage",
        components: {
            VTags,
            EditPassword,
            ThemePicker
        },
        data() {
            return {
                /*  logo: require('../assets/logo.png'),*/
                collapse: false,
                fullscreen: false,
                items: [],
                menus: [],
                showPassword:false,
                passwordData:{},
                chalk: '',
                isThemePicker:false,
                isDebug: process.env.NODE_ENV === 'development'
            }
        },
        computed: {
            username() {
                let user = this.$storage.user.get()
                if (user) {
                    return user.LANG === "EN" ?
                        (user.USER_NAME ? user.USER_NAME : user.USER_ID) :
                        (user.USER_NAME_EN ? user.USER_NAME_EN : user.USER_ID)

                } else return "anonymous"
            },

            key() {
                return this.$route.path
            },
            onRoutes() {
                return this.$route.path.replace('/', '')
            }
        },
        methods: {
            getThemeCluster(theme) {
                const tintColor = (color, tint) => {
                    let red = parseInt(color.slice(0, 2), 16)
                    let green = parseInt(color.slice(2, 4), 16)
                    let blue = parseInt(color.slice(4, 6), 16)

                    if (tint === 0) { // when primary color is in its rgb space
                        return [red, green, blue].join(',')
                    } else {
                        red += Math.round(tint * (255 - red))
                        green += Math.round(tint * (255 - green))
                        blue += Math.round(tint * (255 - blue))

                        red = red.toString(16)
                        green = green.toString(16)
                        blue = blue.toString(16)

                        return `#${red}${green}${blue}`
                    }
                }

                const shadeColor = (color, shade) => {
                    let red = parseInt(color.slice(0, 2), 16)
                    let green = parseInt(color.slice(2, 4), 16)
                    let blue = parseInt(color.slice(4, 6), 16)

                    red = Math.round((1 - shade) * red)
                    green = Math.round((1 - shade) * green)
                    blue = Math.round((1 - shade) * blue)

                    red = red.toString(16)
                    green = green.toString(16)
                    blue = blue.toString(16)

                    return `#${red}${green}${blue}`
                }

                const clusters = [theme]
                for (let i = 0; i <= 9; i++) {
                    clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
                }
                clusters.push(shadeColor(theme, 0.1))
                return clusters
            },      
            updateStyle(style, oldCluster, newCluster) {
                let newStyle = style
                oldCluster.forEach((color, index) => {
                    newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
                })
                return newStyle
            },
            getCSSString(callback, variable) {
                // const xhr = new XMLHttpRequest()
                // xhr.onreadystatechange = () => {
                //     if (xhr.readyState === 4 && xhr.status === 200) {
                //         this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
                //         callback()
                //     }
                // }
                // xhr.open('GET', url)
                // xhr.send()
                Axios.get('/theme.scss').then((res)=>{
                    this[variable] = res
                    callback()
                })
            },
            handleCommand(command) {
                switch (command) {
                    case "loginout":
                        localStorage.removeItem('ms_username')
                        localStorage.removeItem("userId")
                        this.$router.push('/login')
                        break
                    case "en":
                        this.$api.lang.setEn()
                        break
                    case "cn":
                        this.$api.lang.setCn()
                        break
                    case "ko":
                        this.$api.lang.setKo()
                        break
                    case "password":
                        this.showPassword = true
                        break
                    case "themePicker":
                        this.showPassword = true
                        this.isThemePicker = true
                        break
                    default :
                        break
                }
            },
            // 侧边栏折叠
            collapseChage() {
                this.collapse = !this.collapse
                this.$storage.master_page.collapse.set(this.collapse)
            },
            // 全屏事件
            handleFullScreen() {
                let element = document.documentElement
                if (this.fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen()
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen()
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen()
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen()
                    }
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen()
                    } else if (element.webkitRequestFullScreen) {
                        element.webkitRequestFullScreen()
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen()
                    } else if (element.msRequestFullscreen) {
                        // IE11
                        element.msRequestFullscreen()
                    }
                }
                this.fullscreen = !this.fullscreen
            },
            cancelPassord(){
                this.showPassword = false
                this.isThemePicker = false
                this.passwordData = {}
                this.$refs && this.$refs.addForm && this.$refs.addForm.$refs.ruleForm.clearValidate()
            },
            // 修改密码
            confirmPassord(){
                if(this.isThemePicker){
                    this.$root.theme = this.$refs.themeForm.theme
                    this.showPassword = false
                    this.isThemePicker = false
                    return 
                }
                if(this.$refs.addForm && this.$refs.addForm.$refs.ruleForm){
                    this.$refs.addForm.$refs.ruleForm.validate(async (valid)=>{
                        if(!valid){
                            return 
                        }
                        if(this.passwordData.PWD_AGAIN !== this.passwordData.PWD_NEW){
                            this.$show.openWarning(this.$t('v_dialog_two_passwords_is_not_match'))
                            return
                        }
                        let user = this.$storage.user.get()
                        const { modelParaList } = this.$api.parameter
                        const res  = await modelParaList({PWD_OLD:this.passwordData.PWD_OLD,PWD_NEW:this.passwordData.PWD_NEW,USER_ID:user.USER_ID},'USERS_MANAGEMENT#updatePwd')
                        if(res.RETURN.RETURN_MSG === "SUCCESS"){
                            this.showPassword = false
                            localStorage.removeItem('ms_username')
                            localStorage.removeItem("userId")
                            this.$router.push('/login')
                        }
                    })
                }
            }
        },
        mounted() {
            let user = this.$storage.user.get()
            if (user && user.router) {
                const menus = user.router.map(v=>{return {...v,ID:Math.random()}})
                const parentMenus = menus.filter(v=>v.UPPER_MENU_ID === '0').map(v=>{return {...v,subs:[]}})
                const childMenus = menus.filter(v=>v.UPPER_MENU_ID !== '0')
                childMenus.forEach(element => {
                    const index = parentMenus.findIndex(v=>v.MENU_ID === element.UPPER_MENU_ID)
                    index > -1 && parentMenus[index].subs.push(element)
                })
                this.menus = parentMenus
            }

            //如果可视区域小于1500自动收起菜单栏, 酌情开启
            if (document.body.clientWidth < 1500) {
                // this.collapseChage()
            }
            let coll = this.$storage.master_page.collapse.get()
            if (coll === '') {
                this.collapse = false
                this.$storage.master_page.collapse.set(false)
            } else {
                this.collapse = coll
            }
        },
        watch:{
            '$root.theme':{
                deep:true,
                immediate:true,
                handler(val, oldVal){
                    oldVal = oldVal || val
                    if (typeof val !== 'string') return
                    const themeCluster = this.getThemeCluster(val.replace('#', ''))
                    const originalCluster = this.getThemeCluster(oldVal.replace('#', ''))
                    const getHandler = (variable, id) => {
                        return () => {
                            const originalCluster = this.getThemeCluster(ORIGINAL_THEME.replace('#', ''))
                            const newStyle = this.updateStyle(this[variable], originalCluster, themeCluster)

                            let styleTag = document.getElementById(id)
                            if (!styleTag) {
                                styleTag = document.createElement('style')
                                styleTag.setAttribute('id', id)
                                document.head.appendChild(styleTag)
                            }
                            styleTag.innerText = newStyle
                        }
                    }

                    const chalkHandler = getHandler('chalk', 'chalk-style')

                    if (!this.chalk) {
                        // const url = `https://unpkg.zhimg.com/element-ui@${version}/lib/theme-chalk/index.css`
                        this.getCSSString(chalkHandler, 'chalk')
                    } else {
                        chalkHandler()
                    }

                    const styles = [].slice.call(document.querySelectorAll('style'))
                        .filter(style => {
                        const text = style.innerText
                        return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
                        })
                    styles.forEach(style => {
                        const { innerText } = style
                        if (typeof innerText !== 'string') return
                        style.innerText = this.updateStyle(innerText, originalCluster, themeCluster)
                    })
                }
            }
        }
    }
</script>
<style lang="scss">
     .el-dropdown-menu{
        padding: 0 !important;
        margin: 0 !important;
        .el-dropdown-menu__item--divided{
            margin-top: 0;
            &:before{
                margin: 0 !important;
                width: 0;
            }
        }
    }
    .wrapper ,.app-main{
      height: 100%;
      width: 100%;
    }
    .header {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: 70px;
      font-size: 22px;
      color: #fff;
      //background-image: linear-gradient(180deg, #0885ab 0%, #034e73 100%);
      box-shadow: 0px 2px 4px rgba(0, 1, 60, 0.53);
      .collapse-btn {
        float: left;
        padding: 0 21px;
        cursor: pointer;
        line-height: 70px;
      }
      .logo {
        float: left;
        width: 70px;
        line-height: 70px;

        img {
            width: 50px;
            margin-top: 18px;
        }
      }
      .des {
        float: left;
        width: 370px;
        line-height: 70px;
        letter-spacing: 2px;
      }
      .header-right {
        float: right;
        padding-right: 10px;
        .header-right-con {
          display: flex;
          height: 70px;
          align-items: center;
        }
      }
      .user-avator {
        margin-right: 5px;
        img {
            display: block;
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
      }
      .user-info{
        color: #fff;
        cursor: pointer;
      }
      .btn-fullscreen {
        transform: rotate(45deg);
        margin-right: 5px;
        font-size: 22px;
        position: relative;
        text-align: center;
        border-radius: 15px;
        cursor: pointer;
      }

      .btn-logout {
          padding-left: 10px;
          margin-right: 5px;
          font-size: 24px;

          position: relative;
          width: 30px;
          height: 30px;
          text-align: center;
          border-radius: 15px;
          cursor: pointer;
      }

    }
    .sidebar {
      display: block;
      position: absolute;
      left: 0;
      top: 70px;
      bottom: 0;
      overflow-y: scroll;
      //background-image: linear-gradient(180deg, #0885ab 0%, #034e73 100%);
      color: #c4e7f8;
      .el-menu {
        background: transparent;
        height: 100%;
      }
      .customer{
        font-size: 16px;
      }
      .el-menu-item, .el-submenu__title{
        color: #c4e7f8;
        i{
          color: currentColor;
          width: 24px;
          margin-right: 10px;
          &:last-child{
            margin-right: 0;
          }
        }
        &:hover,&:focus{
          background-color:rgba(4, 77, 116, 0.3);
        }
      }
    }
    .content-box {
      position: absolute;
      left: 200px;
      right: 0;
      top: 70px;
      bottom: 0;
      -webkit-transition: left .3s ease-in-out;
      transition: left .3s ease-in-out;
      background: #f0f0f0;
      height: calc(100% - 70px);
    }
    .content {
      width: auto;
      height: calc(100% - 42px);
      padding: 10px 4px 10px 10px;
      overflow-y: scroll;
      box-sizing: border-box;
    }
    .content-collapse {
      left: 65px;
    }
    .sidebar-el-menu:not(.el-menu--collapse) {
      width: 200px;
    }
    .el-menu--collapse{
      .el-menu-item,.el-submenu__title{
        text-align: center;
        i{
          margin-right: 0 !important;
        }
        span,.el-icon-arrow-right{
          display: none;
        }
      }
    }
    .el-menu--vertical{
      .el-menu--popup{
        width: max-content;
        min-width: auto;
        .el-menu-item{
          padding-left:14px;
          height:36px;
          line-height:36px;
          i{
            margin-right:8px;
            width: 24px;
          }
        } 
      }
    }
</style>