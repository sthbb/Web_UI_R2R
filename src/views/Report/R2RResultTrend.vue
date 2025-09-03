<template>
    <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="searchFn" @submit="searchSubmit" @reset="resetSubmit" ref="searchRef"/>
          </template>
        </div>
        <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
          <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
        </span>
      </div>
      <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="$t('r2r_result_trend')" name="1">
            <div id="canvas" :class="[tableOptions.data.length === 0 ? 'no-content' :'']">{{$t('com_no_content')}}</div>
          </el-tab-pane>
          <el-tab-pane :label="$t('r2r_result_table')" name="2"><BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef"/></el-tab-pane>
        </el-tabs>
      </div>
    </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import { getHasPrivTip,getFuncID,searchValidata } from '@/commn/decoratorFn'
import moment from 'moment'
import * as echarts from 'echarts'
import { option ,secondLineData } from '@/commn/echartsOption'
import { getColMap,resetParams,formatParam,timeFormat,filterLineChartDate,searchFormSetting,selectChangeSetting,objValueIsNull,findSearchRules,getTableType,columnsCellShow,addSelectOptions} from '@/commn/commonFn'
export default {
  components: {
    BaseTable,
    BaseSearch,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      isCollapse: false,
      timeArr:[],
      switchArr:[],
      tableOptions: {
        id: "R2R_RESULT_SUM_KEY",
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons: []
        },
      },
      myChart:null,
      activeTab:'1',
      limitTime:7,
      startTime:'',
      endTime:''
    }
  },
  created() {
    this.init()
  },
  methods: {
    @getFuncID('Report/R2RResultTrend')
    async init(){
      this.startTime = moment(new Date()).subtract('days',this.limitTime - 1).format('YYYY-MM-DD 00:00:00')
      this.endTime = moment(new Date()).format("YYYY-MM-DD 23:59:59")
      this.searchParams.SUM_TIME_END = this.endTime
      this.searchParams.SUM_TIME_BEGIN = this.startTime
      this.loadSearchColumns()
      this.loadColumns()
    },
    //加载搜索条件
    async loadSearchColumns(reserveData=false){
      const searchForm = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'R2R_RESULT_TREND',
        SEARCH_DISP_YN:'Y'
      }) || []
      const res =  await searchFormSetting(resetParams((searchForm || []),true),this.searchParams,reserveData) 
      this.searchParams = {...this.searchParams,...res.params}
      this.searchForm = await columnsCellShow(res.data,this.searchParams,true) 
    },
    // 搜索的change事件
    async searchFn(data){
      const areaIdSeq = +(this.searchForm.find(v=>v.COL_NAME === 'AREA_ID').COL_DISP_SEQ)
      const currentSeq = +(this.searchForm.find(v=>v.COL_NAME === data.key).COL_DISP_SEQ) // 当前key的序号
      if(data.key === 'AREA_ID' || currentSeq < areaIdSeq ){
        this.searchForm = await columnsCellShow(this.searchForm,this.searchParams,true) 
      }
      const res = await selectChangeSetting(data.key,this.searchForm,this.searchParams)
      this.searchParams = res.params
      this.searchForm = res.data
    },
    // // 日期时间禁用
    // disabledDate(colName){
    //   const searchName = colName === 'SUM_TIME_BEGIN' ? 'SUM_TIME_END' : 'SUM_TIME_BEGIN'
    //   const findIndex = this.searchForm.findIndex(v=>v.COL_NAME === searchName)
    //   let pickerOptions = [this.startTime,this.endTime]
    //   if(!this.searchParams.SUM_TIME_BEGIN || !this.searchParams.SUM_TIME_END){
    //     this.searchForm = this.searchForm.map(v=>{return {...v,pickerOptions:['SUM_TIME_BEGIN','SUM_TIME_END'].includes(v.COL_NAME) ? pickerOptions : ''}})
    //   }else{
    //     pickerOptions = colName === 'SUM_TIME_BEGIN' ? [this.searchParams.SUM_TIME_BEGIN,this.endTime] : [this.startTime,this.searchParams.SUM_TIME_END]
    //     this.searchForm[findIndex].pickerOptions = pickerOptions
    //   }
    // },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true){
      this.searchParams = {...this.searchParams,...data}
      this.searchParams.RSUM_TIME_BEGIN = this.searchParams.RSUM_TIME_BEGIN ? moment(this.searchParams.RSUM_TIME_BEGIN).format('YYYY-MM-DD HH:mm:ss') : null
      this.searchParams.SUM_TIME_END = this.searchParams.SUM_TIME_END ? moment(this.searchParams.SUM_TIME_END).format('YYYY-MM-DD HH:mm:ss') : null
      this.toNull()
      const newDate = new Date(moment(this.searchParams.RSUM_TIME_BEGIN).format('YYYY-MM-DD 00:00:00')).getTime()
      const endDate = new Date(moment(this.searchParams.SUM_TIME_END).format('YYYY-MM-DD 00:00:00')).getTime()
      if(newDate > endDate){
        this.$show.openWarning(this.$t('v_notice_begin_less_than_endhan_end'))
        return
      }
      if((endDate - newDate) >= +this.limitTime*24*60*60*1000){
        this.$show.openWarning(this.$t('v_notice_time_interval') + this.limitTime + this.$t('v_notice_day'))
        return
      }
      reloadSearchData && await this.loadColumns()
      this.load()
    },
    // 重置搜索条件
    resetSubmit(data){
      this.searchParams = {...this.searchParams,...data,SUM_TIME_END:this.endTime,SUM_TIME_BEGIN:this.startTime}
      this.tableOptions.data = []
      this.myChart && this.myChart.dispose()
    },
    // 搜索
    toSearch(reloadSearchData){
     this.searchSubmit(undefined,reloadSearchData) 
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["page",() => {this.toSearch(false)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载table 列
    async loadColumns(){
      this.tableOptions.columns = []
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'R2R_RESULT_TREND',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      const tableTypeResult = getTableType(columns)
      this.timeArr = tableTypeResult.timeArr
      this.switchArr = tableTypeResult.switchArr
      columns = await addSelectOptions(columns,{...this.searchParams,R2R_MODEL_NAME:null}) // 获取select 下拉框数据
      columns = await columnsCellShow(columns,this.searchParams) // 单元cell的展示与隐藏根据搜索条件走
      this.tableOptions.columns = columns
      const dom = document.querySelector('.device-parameter')
      this.tableOptions.maxHeight = (dom.offsetHeight - 85)
    },
    //加载列表数据
    async load(params = this.searchParams,type='R2RRESUTLSUM_MANAGEMENT#select'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      this.tableOptions.data = formatParam((res.DATA||[]),this.timeArr,this.switchArr).map((v,i)=>{return {...v,ROW_NUM:i+1}})
      this.clearSort()
      const xArr = this.tableOptions.data.map(v=>timeFormat(v.SUM_TIME,'HH:MM'))
      const yArr = this.tableOptions.data.map(v=>v.R2R_RESULT_CNT || 0)
      var chartDom = document.getElementById('canvas')
      this.myChart && this.myChart.dispose()
      chartDom.style.height = xArr.length > 0 ? this.tableOptions.maxHeight + 'px' : 0
      chartDom.innerHTML = this.$t('com_no_content')
      if(xArr.length > 0){
        let options = option
        options.tooltip = {
          ...option.tooltip,
          formatter:(data)=>{return this.formatter(data)}
        }
        options.xAxis[0].data = xArr
        options.series = [options.series[0]]
        options.series[0].data = yArr
        const dates = filterLineChartDate(this.tableOptions.data,'SUM_TIME').dates
        const dateObj = filterLineChartDate(this.tableOptions.data,'SUM_TIME').dateObj
        dates.forEach(v=>{
          const dataItem = {...secondLineData,data:[{name:v,value:1}]}
          dateObj[v] ? dataItem.barWidth = (100/this.tableOptions.data.length)*dateObj[v]+'%' : ''
          options.series.push(dataItem)
        })
        this.myChart = echarts.init(chartDom)
        this.myChart.setOption(options)
      }
    },
    // tooltip 提示文案
    formatter(data){
      if(data.componentIndex !== 0){
        return 
      }
      const currentData = this.tableOptions.data[data.dataIndex]
      const time = currentData.SUM_TIME ? 'Time: ' + timeFormat(currentData.SUM_TIME,'YYYY-mm-DD HH:MM') : ''
      const legend = currentData.R2R_RESULT_CODE ? 'R2R Result: ' + currentData.R2R_RESULT_CODE : ''
      const value = currentData.R2R_RESULT_CNT ? 'Value: ' + currentData.R2R_RESULT_CNT : ''
      return  (time ? (time + '<br/>') : '') + (legend ? (legend + '<br/>') : '') + value
    },
    toNull(){
      for(let key in this.searchParams){
        this.searchParams[key] = this.searchParams[key] || null
      }
    },
    // 清楚sort状态
    clearSort(){
      this.$nextTick(()=>{this.$refs.tableRef?.clearSort()})
    }
  },
  mounted(){
    window.onresize = () => {
      this.myChart && this.myChart.resize()
    }
  },
  beforeDestroy(){
    this.myChart && this.myChart.dispose()
  }
}
</script>
