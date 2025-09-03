/**
 *
 *   本地存储帮助类
 *
 */

let checkLocalStorage = function () {
    if (!window.localStorage) {
        // console.log('浏览器不支持本地存储')
        return false
    } else return true
}
let checkSessionStorage = function () {
    if (!window.sessionStorage) {
        // console.log('浏览器不支持本地存储')
        return false
    } else return true
}
checkLocalStorage()
checkSessionStorage()

let setLocal = function (name, value) {
    if (checkLocalStorage()) {
        localStorage.setItem(name, value)
    }
}
let getLocal = function (name) {
    const value = localStorage.getItem(name)
    if (value) {
        return value
    } else {
        return ''
    }
}

let setSession = function (name, value) {
    if (checkSessionStorage()) {
        sessionStorage.setItem(name, value)
    }
}
let getSession = function (name) {
    const value = sessionStorage.getItem(name)
    if (value) {
        return value
    } else {
        return ''
    }
}
let delSession = function (name) {
    if (checkSessionStorage()) {
        sessionStorage.removeItem(name)
    }
}
let clearSession = function () {
    if (checkSessionStorage()) {
        sessionStorage.clear()
    }
}
let paresJson = function (json) {
    //console.log(json)
    if (json) {
        return JSON.parse(json)
    } else return null
}


export default {
    clearSession() {
        clearSession()
    },
    master_page: {
        collapse: {
            get: function () {
                return getLocal("collapse") == "true"
            },
            set: function (val) {
                setLocal("collapse", val)
            },
        }
    },
    token: {
        del() {
            //console.log('set token api', token)
            delSession("Token")
        },
        get: function () {
            return getSession("Token")
        },
        set: function (val) {
            //console.log('set token', val)
            setSession("Token", val)
        },
    },
    user: {
        get: function () {
            return paresJson(getSession("User"))
        },
        set: function (val) {
            //console.log('set token', val)
            setSession("User", JSON.stringify(val))
        },
    },
    lang: {
        get: function () {
            return getLocal("Lang")
        },
        set: function (val) {
            //console.log('set token', val)
            setLocal("Lang", val)
        }
    },


}