
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<!--<meta http-equiv="Cache" content="no-cache">-->
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<template>
    <div class="bg">
        <div class="login" border="0" cellspacing="0" cellpadding="0">
            <div class="login-form theme-main" >
                <el-form ref="loginForm" :model="loginForm" :rules="loginRules" auto-complete="on" label-position="left" size="small">
                    <h3 class="title"> {{ $t('login_title') }}</h3>
                    <el-form-item prop="username">
                        <span class="iconfont icon-user"></span>
                        <el-input
                            v-model="loginForm.username"
                            :placeholder="$t('v_notice_input_user_id')"
                            name="username"
                            type="text"
                            tabindex="1"
                            auto-complete="on"
                            @keyup.enter.native="handleLogin"
                        />
                    </el-form-item>
                    <el-form-item prop="password">
                        <span class="iconfont icon-password"></span>
                        <el-input
                            v-model="loginForm.password"
                            type="password"
                            :placeholder="$t('v_notice_password_is_cannot_be_empty')"
                            name="password"
                            tabindex="2"
                            auto-complete="on"
                            show-password
                            @keyup.enter.native="handleLogin"
                        />
                    </el-form-item>
                    <el-form-item prop="lang">
                        <span class="iconfont icon-language"></span>
                        <el-select v-model="lang" :placeholder="this.$t('v_dinotice_select_language')" @change="changeLang" >
                            <el-option label="中文" :value="this.$api.lang.zh_CN"></el-option>
                            <el-option label="English" :value="this.$api.lang.en_US"></el-option>
                            <el-option label="韩语" :value="this.$api.lang.ko"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-button :loading="loading" type="primary" class="login-botton" @click.native.prevent="()=>{handleLogin(loginForm)}">{{ this.$t('login_button') }}</el-button>
                </el-form>
                </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Login',
        data() {
            const validateUsername = (rule, value, callback) => {
                if (value.length < 1) {
                    callback(new Error(this.$t('v_notice_username_is_cannot_be_empty')))
                } else {
                    callback()
                }
            }
            const validatePassword = (rule, value, callback) => {
                if (value.length < 1) {
                    callback(new Error(this.$t('v_notice_password_is_cannot_be_empty')))
                } else {
                    callback()
                }
            }
            return {
                lang: null,
                loginForm: {
                    username: '',
                    password: ''
                },
                loginRules: {
                    username: [{required: true, trigger: 'blur', validator: validateUsername}],
                    password: [{required: true, trigger: 'blur', validator: validatePassword}]
                },
                loading: false,
                redirect: undefined
            }
        },
        watch: {
            $route: {
                handler: function (route) {
                    this.redirect = route.query && route.query.redirect
                    route.query.username === 'test' && route.query.password === '111111' && this.toLogin(route.query)
                },
                immediate: true
            }
        },
        mounted: function () {
            this.lang = this.$storage.lang.get()
        },
        methods: {
            changeLang() {
                this.$api.lang.setLanguage(this.lang)
                this.$storage.lang.set(this.lang)
            },
            handleLogin(params) {
                this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        this.loading = true
                        this.toLogin(params)
                    }
                })
            },
            toLogin(params){
                this.$api.commn.login(params.username, params.password).then(result => {
                    let res = result.DATA[0]
                    let token = "Bearer " + res.TOKEN
                    const user = res.USER_INFO
                    const router = (res.ROUTER_LIST || [])
                    user.router = router
                    localStorage.setItem("userId", user.USER_ID)
                    this.$api.setToken(token)
                    this.$storage.token.set(token)
                    this.$storage.user.set(user)
                    this.$router.refreshRouter(router)
                    router.length > 0 && this.$router.push({path: this.redirect || '/Home'})
                }).finally(()=>{
                    this.loading = false
                })
            }
        }
    }
</script>

<style lang="scss">
    $cursor: #0d0d0d;
    $bg: #2d3a4b;
    $dark_gray: #889aa4;
    $light_gray: #1e1f18;
    $bg_color: rgba(71, 71, 71, 0.5);
    $login_form_bg_color: rgba(255, 255, 255, 0.9);
    @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
        .login-form .el-input input {
            color: $cursor;
        }
    }
    input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px #dcdfe0 inset;
    }
    .bg {
        position: fixed;
        overflow: hidden;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        z-index: 0;

        &:before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
            z-index: -2;
            filter: blur(2px);
            background: url(../assets/login_images/bg_03.jpg) no-repeat top left;
            background-size: cover;
            animation: imageAnimation 36s linear infinite 0s;
        }

        &:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
            z-index: -1;
            background-color: $bg_color;
        }

        @keyframes imageAnimation {
            0% {
                opacity: 0;
                animation-timing-function: ease-in;
            }
            5% {
                opacity: 1;
                animation-timing-function: ease-out;
            }
            8% {
                opacity: 1;
                transform: scale(1.05);
            }
            17% {
                opacity: 1;
                transform: scale(1.1);
            }

            100% {
                opacity: 0;
                transform: scale(1.1)
            }
        }
        .login {
            position: relative;
            width: 75vw;
            height: 85vh;
            max-width: 100%;
            margin: 10vh auto;
            overflow: hidden;
            background: url(../assets/login_images/bg_03.jpg) no-repeat top left;
            background-size: cover;

            .title {
                font-size: 30px;
                color: $light_gray;
                text-align: center;
                font-weight: bold;
                margin-bottom: 50px;
            }

            .logo {
                width: 520px;
                background-color: $login_form_bg_color;
                padding: 10px 1vw;
                vertical-align: top;
                text-align: right;
                height: 70px;
                img {
                    height: 70px;
                }

            }
            .login-form {
                width: 520px;
                background-color: $login_form_bg_color;
                padding: 70px;
                vertical-align: top;
                text-align: center;
                padding-top: 60px;
                height:100%;
                float:right;
                min-height:360px;
                .el-form-item__content{
                    display: flex;
                    background: #dcdfe0;
                    border-radius: 6px;
                    align-items: center;
                    padding: 0 16px;
                    > div{
                        flex: 1;
                    }
                    .el-input__inner{
                        height: 50px !important;
                        line-height: 50px !important;
                        background-color:#dcdfe0;
                        border-color: #dcdfe0;
                    }
                    .iconfont{
                        color: #889aa4;
                        margin-top: -7px;
                    }
                }

                .login-botton{
                    height: 50px !important;
                    width: 100%;
                }


                // .show-pwd {
                //     position: absolute;
                //     right: 10px;
                //     top: 7px;
                //     font-size: 16px;
                //     color: $dark_gray;
                //     cursor: pointer;
                //     user-select: none;
                // }
            }
        }
    }
    @media screen and (max-width: 1400px) {
        .login-form {
            width:420px !important;
            padding:35px !important;
            .title{
                margin-bottom:30px !important;
                font-size:26px !important;
            }
        }
    }
</style>
