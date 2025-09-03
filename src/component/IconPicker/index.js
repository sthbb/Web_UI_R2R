import iconPicker from './IconPicker'
import 'font-awesome/css/font-awesome.min.css'

const install = function (Vue) {
    Vue.component(iconPicker.name, iconPicker)
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export {iconPicker}

export default {
    install: install,
    iconPicker: iconPicker
}

