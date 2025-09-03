<!--清缓存-->

<template>
    <div class="dashboard-container">
        <!-- <el-row class="tools">
            <el-col :span="2">
                <el-button type="success" icon="fa fa-plus" size="mini" @click="show_edit_diag"> 添加</el-button>
            </el-col>
            <el-col :span="2">
                <el-button type="warning" icon="fa fa-rotate-right" size="mini" @click="reload_service"> 重载</el-button>
            </el-col>
        </el-row>
        <div class="Card" v-for="ser in serviceList" :key="ser.ID">
            <el-row class="title" type="flex" justify="space-around">
                <el-col :span="10" v-text="ser.name">
                </el-col>
                <el-col :span="5" v-text="ser.pid">
                </el-col>
                <el-col :span="4" v-text="ser.status" :style="{color:[ser.status==='running' ? 'green' : ser.status==='stopped' ?'red':'yellowgreen' ]}">
                </el-col>
                <el-col :span="5">
                    <el-button v-if="ser.status==='running'&&ser.pid!==processID" type="danger" icon="fa fa-stop" size="mini" @click="stop_service(ser.name)"> 停止</el-button>
                    <el-button v-else-if="ser.status==='stopped'" type="success" icon="fa fa-play" size="mini" @click="start_service(ser.name)"> 启动</el-button>
                </el-col>
            </el-row>
            <el-row class="sub_title" type="flex" justify="space-around">
                <el-col :span="14" v-text="ser.path" style="font-size: x-small">
                </el-col>
                <el-col :span="5">
                    <el-button type="danger" icon="fa fa-trash" size="mini" @click="del_service(ser.name)"> 删除</el-button>
                </el-col>
                <el-col :span="5">
                    <el-button type="warning" icon="fa fa-edit" size="mini" @click="show_edit_diag(ser.name)"> 修改</el-button>
                </el-col>
            </el-row>
            <v-echart :options="ser.option" class="chart"></v-echart>
        </div> -->
        <el-dialog :title="edit_title" :visible.sync="dialogFormVisible">
            <el-form :model="program" label-width="120px" :label-position="'right'" :rules="rules" ref="program">
                <el-form-item label="显示名称" prop="name">
                    <el-input v-model="program.name" autocomplete="off" placeholder="名称必须是唯一的"></el-input>
                </el-form-item>

                <el-form-item label="启动命令" prop="command">
                    <el-input v-model="program.command" autocomplete="off" placeholder="启动程序的命令, ex: ./df -h"></el-input>
                </el-form-item>

                <el-form-item label="环境变量">
                    <el-input v-model="program.environ" autocomplete="off" placeholder="Environment, ex: LD_LIB=ABC;"></el-input>
                </el-form-item>
                <el-form-item label="目录">
                    <el-input v-model="program.directory" autocomplete="off" placeholder="directory, default is / "></el-input>
                </el-form-item>
                <el-form-item label="启动用户" prop="user">
                    <el-autocomplete class="inline-input" v-model="program.user" :fetch-suggestions="userDef" placeholder="执行程序的用户名"></el-autocomplete>
                </el-form-item>
                <el-form-item label="失败重试次数">
                    <el-input-number v-model="program.startRetries" :min="0" :max="3"></el-input-number>
                </el-form-item>
                <el-form-item label="自动启动">
                    <el-switch v-model="program.startAuto"></el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel_click_diag">取 消</el-button>
                <el-button type="primary" @click="ok_click_diag">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'ServiceProcessLogMgmt',
        methods: {
            formatBytes(value) {
                var bytes = parseFloat(value)
                if (bytes < 0) return "-"
                else if (bytes < 1024) return bytes + " B"
                else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB"
                else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB"
                else return (bytes / 1073741824).toFixed(1) + " GB"
            },
            //获取默认设置
            get_option(x, cpu, rss) {
                return {
                    color: ['#35B0AB', '#DE356A'],
                    xAxis: {
                        gridIndex: 0,
                        type: 'category',
                        data: x,
                    },
                    grid: {
                        x: 45,
                        y: 40,
                        x2: 55,
                        y2: 110,
                        borderWidth: 1
                    },
                    yAxis: [
                        {
                            gridIndex: 0,
                            type: 'value',
                            name: 'CPU',
                            min: 0,
                            max: 100,
                            axisLabel: {formatter: '{value} %'}
                        },
                        {
                            gridIndex: 0,
                            type: 'value',
                            name: '内存',
                            axisLabel: {
                                formatter: this.formatBytes
                            },
                        }
                    ],
                    series: [
                        {
                            name: 'CPU',
                            type: 'line',
                            yAxisIndex: 0,
                            areaStyle: {},
                            animation: false,
                            smooth: true,
                            markPoint: {
                                data: [{type: 'max'}]
                            },
                            data: cpu
                        },
                        {
                            name: '内存',
                            type: 'line',
                            yAxisIndex: 1,
                            animation: false,
                            smooth: true,
                            markPoint: {
                                data: [
                                    {type: 'max'}
                                ]
                            },
                            data: rss
                        },
                    ]
                }
            },
            bind_chart_data(str) {
                //console.log(str)
                this.serviceList = []
                let obj = JSON.parse(str).Message
                for (let i = 0; i < obj.length; i++) {
                    this.serviceList.push({
                        pid: obj[i].pid,
                        cmd: obj[i].cmd,
                        name: obj[i].name,
                        path: obj[i].path,
                        status: obj[i].status,
                        option: this.get_option(obj[i].time, obj[i].cpu, obj[i].rss)
                    })
                }
            },
            start_service(name) {
                this.$api.Service.startService(name).then(res => {
                    this.$show.success('启动服务成功')
                    this.serviceList = []
                })
            },
            stop_service(name) {
                this.$api.Service.stopService(name).then(res => {
                    this.$show.success('停止服务成功')
                    this.serviceList = []
                })
            },
            reload_service() {
                this.$api.Service.reloadService().then(res => {
                    this.$show.success(res.data.value)
                    this.serviceList = []
                })
            },
            show_edit_diag(name) {
                if (typeof (name) == 'string') {
                    this.isNew = false
                    //修改
                    this.edit_title = name + ' 修改'
                    this.$api.Service.getServiceInfo(name).then(res => {
                        let tmp = res.data.value.program
                        this.program.name = tmp.name
                        this.program.command = tmp.command
                        this.program.directory = tmp.directory
                        this.program.user = tmp.user
                        this.program.environ = tmp.environ.join()
                        this.program.startRetries = tmp.startRetries
                        this.program.startAuto = tmp.startAuto

                        // console.log(this.program)
                    })

                } else {
                    //添加
                    this.edit_title = '增加'
                    this.isNew = true
                    this.program.name = ''
                    this.program.command = ''
                    this.program.directory = ''
                    this.program.user = ''
                    this.program.environ = ''
                    this.program.startRetries = 3
                    this.program.startAuto = false
                }
                this.dialogFormVisible = true
            },
            ok_click_diag() {
                // console.log(this.program)
                if (this.isNew) {
                    this.$api.Service.addService(this.program).then(res => {
                        //console.log(res.data.status)
                        if (res.data.status === 0) this.$show.success("添加成功")
                        else this.$show.openFailed("添加失败 " + res.data.error)
                    })
                } else {
                    this.program.startSeconds = 2
                    this.program.stopTimeout = 3
                    this.program.log_disable = false
                    this.program.stderr_only = false
                    this.$api.Service.updateService(this.program).then(res => {
                        if (res.data.status === 0) this.$show.success("更新成功")
                        else this.$show.openFailed("更新失败 " + res.data.error)
                    })
                }
                this.cancel_click_diag()
            },
            del_service(name) {
                this.$confirm('确认删除？').then(_ => {
                    this.$api.Service.delService(name).then(res => {
                        if (res.data.status === 0) this.$show.success("删除成功")
                        else this.$show.openFailed("删除失败 " + res.data.error)
                        this.serviceList = []
                    })
                })
            },
            cancel_click_diag() {
                this.dialogFormVisible = false
            },
            userDef(queryString, cb) {
                // console.log(queryString)
                cb([{value: 'root'}, {value: 'user'}])
            }
        },
        watch: {
            //添加路由监听， 当离开当前页面时停止监听数据
            // $route(to) {
            //     if (to.path !== '/home') this.$signalR.stopServiceMonitorListener(this.groupName,this.funcName)
            //     else this.$signalR.startServiceMonitorListener(this.groupName,this.funcName)
            // }
        },
        mounted() {
            //获取当前程序进程ID. 防止把当前程序结束后无法访问管理后台
            this.$api.systemManagement.getCurrentProcessID().then(res => {
            //   console.log(res)
                this.processID = res.DATA
              
                // console.log(this.processID)
            })
            // //将SignalR发来的数据绑定图表
            // this.$bus.$on(this.funcName, (obj) => this.bind_chart_data(obj))
            // //连接SignalR服务器后 添加图表数据监听
            // this.$bus.$on('signalR_Status', () => this.$signalR.startServiceMonitorListener(this.groupName,this.funcName))
            // this.$signalR.startServiceMonitorListener(this.groupName,this.funcName)
        },
        data() {
            return {
                serviceList: [],
                processID: 0,
                dialogFormVisible: false,
                program: {
                    name: '',
                    command: '',
                    user: '',
                    environ: '',
                    directory: '',
                    startRetries: 3,
                    startAuto: false
                },
                edit_title: '',
                isNew: true,
                rules: {
                    name: [
                        {required: true, message: '请输入服务名称', trigger: 'blur'},
                        {min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur'}
                    ],
                    command: [
                        {required: true, message: '请输入启动命令', trigger: 'change'}
                    ],
                    user: [
                        {required: true, message: '请输入启动用户', trigger: 'change'}
                    ]
                },
                groupName:'ServiceMonitor',
                funcName:'PerformanceInfo'
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dashboard {
        &-container {
            margin: 10px;
            height: 100%;

            .tools {
                padding: 10px 5px;
            }
        }

        &-text {
            font-size: 30px;
            line-height: 46px;
        }

    }


    .Card {
        display: block;
        float: left;
        letter-spacing: 0.02em;
        line-height: 26px;
        margin: 0 1% 1% 0;
        overflow: hidden;
        position: relative;
        text-decoration: none;
        width: 390px;
        height: 300px;
        z-index: 1;
        border-radius: 4px;
        border: 1px solid #949494;
        color: #303133;
        transition: .3s;

        .title {
            padding: 5px 10px;
            border-bottom: 1px solid #949494;
            box-sizing: border-box;
            position: relative;
            text-align: left;
            vertical-align: center;
        }

        .sub_title {

            padding: 5px 10px;
            border-bottom: 1px solid #949494;
            box-sizing: border-box;
            position: relative;
            text-align: left;
            vertical-align: center;
        }


    }
</style>
