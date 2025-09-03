/**
 * Created by DingLiangLiang on 2020/4/15.
 */
'use strict'
import echarts from 'echarts/lib/echarts'

// 引入折线图
import 'echarts/lib/chart/line'
// 引入柱状图
import 'echarts/lib/chart/bar'
// 引入极地图
import 'echarts/lib/component/polar'
//引入饼图
import 'echarts/lib/chart/pie'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markPoint'


export default {
    install: function (Vue) {
        // 注册组件后即可使用
        Vue.component('v-echart', this)
    },
    template: '<div style="width: 100%;height: 100%"></div>',
    props: {
        options: Object,
        group: String,
    },
    watch: {
        options: {
            deep: true,  // 深度监听
            handler() {
                this.refresh()
            }
        },
        group() {
            this.refresh()
        }
    },
    methods: {
        refresh() {
            if (this.options) {
                let echart = echarts.init(this.$el)
                echart.clear()
                echart.setOption(this.options)
                if (this.group) {
                    echart.group = this.group
                }
            }
        }
    },
    mounted() {
        this.refresh()
    },
}