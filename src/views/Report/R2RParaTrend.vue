<template>
    <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" @reset="(data)=>{searchFn(data,2)}" ref="searchRef" labelWidth="100px"/>
          </template>
        </div>
        <span class="arror" @click="toCollapse" :style="{background:$root.theme}">
          <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
        </span>
      </div>
      <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
        <BaseTabs :activeTab="activeTab" :tabs="tabs" @childEmit="(item)=>{activeTab = item;item === '1' && $nextTick(()=>{initChart()})}" class="m-b-18"/>
        <div id="canvas" v-if="activeTab === '1'" :class="[tableOptions.data.length === 0 ? 'canvas-no-content' :'']">{{$t('com_no_content')}}</div>
        <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef" v-if="activeTab === '2'"/>
      </div>
    </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import BaseSearch from "@/component/BaseSearch"
import BaseTabs from "@/component/BaseTabs"
import BaseTitle from "@/component/BaseTitle"
import moment from 'moment'
import { getHasPrivTip ,getFuncID,searchValidata,addValidate} from '@/commn/decoratorFn'
import * as echarts from 'echarts'
import {loadColumns,clearSort,loadSearchColumns,resetSubmit,searchFn,getTableHeight } from '@/commn/comTable'
import { option ,secondLineData,newOptions } from '@/commn/echartsOption'
import {filterLineChartDate,objValueIsNull,getSearchLimitTime,getFinallyData } from '@/commn/commonFn'
export default {
  components: {
    BaseTable,
    BaseSearch,
    BaseTabs,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID:"R2R_PARA_TREND",
      isCollapse: false,
      timeArr:[],
      switchArr:[],
      tableOptions: {
        id: "CURR_PARA_SPEC_KEY",
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons: []
        }
      },
      myChart:null,
      activeTab:'1',
      limitTime:7,
      startTime:'',
      endTime:'',
      tabs:[
        {label:'v_report_r2r_para_trend',name:'1'},
        {label:'v_report_r2r_para_table',name:'2'}
      ]
    }
  },
  created() {
    this.init()
  },
  methods: {
    @getFuncID('Report/R2RParaTrend')
    async init(){
      this.limitTime = +(await getSearchLimitTime({ENUM_ID:'SEARCH_PERIOD_PARA_TREND',FAC_ID:this.searchParams.FAC_ID}) || '7')
      loadColumns.call(this)
      await loadSearchColumns.call(this)
      this.startTime = moment(new Date()).subtract('days',this.limitTime - 1).format('YYYY-MM-DD 00:00:00')
      this.endTime = moment(new Date()).format("YYYY-MM-DD 23:59:59")
      this.searchParams = {...this.searchParams,R2R_TIME_END:this.endTime,R2R_TIME_BEGIN:this.startTime}
    },
    toCollapse(){
      this.isCollapse = !this.isCollapse;
      setTimeout(()=>{
        this.$nextTick(()=>{
          this.initChart()
        })
      },500)
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : (resetSubmit.call(this,{...data,R2R_TIME_END:this.endTime,R2R_TIME_BEGIN:this.startTime}),this.initChart())
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // 搜索
    @addValidate()
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
    //加载列表数据
    async load(params = this.searchParams,type='CURRR2RPARAHIST_MANAGEMENT#selectWebApi'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res = await modelParaList(params,type)
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams).map(v=>{return {...v,ID:Math.random()}})
      clearSort.call(this)
      this.initChart()
      // const xArr = this.tableOptions.data.map(v=>timeFormat(v.CREATE_TIME,'HH:MM'))
      // const yArr = this.tableOptions.data.map(v=>v.R2R_VAL || 0)
      // var chartDom = document.getElementById('canvas')
      // this.myChart && this.myChart.dispose()
      // chartDom.style.height = xArr.length > 0 ? this.tableOptions.maxHeight + 'px' : 0
      // chartDom.innerHTML = this.$t('com_no_content')
      // if(xArr.length > 0){
      //   let options = option
      //   options.tooltip = {
      //     ...option.tooltip,
      //     formatter:(data)=>{return this.formatter(data)}
      //   }
      //   options.xAxis[0].data = xArr
      //   options.series = [options.series[0]]
      //   options.series[0].data = yArr
      //   const dates = filterLineChartDate(this.tableOptions.data,'CREATE_TIME').dates
      //   const dateObj = filterLineChartDate(this.tableOptions.data,'CREATE_TIME').dateObj
      //   dates.forEach(v=>{
      //     const dataItem = {...secondLineData,data:[{name:v,value:1}]}
      //     dateObj[v] ? dataItem.barWidth = (100/this.tableOptions.data.length)*dateObj[v]+'%' : ''
      //     options.series.push(dataItem)
      //   })
      //   this.myChart = echarts.init(chartDom)
      //   this.myChart.setOption(options)
      // }
    },
    // 绘制折线图
    initChart(){
      const result = this.tableOptions.data
      const chartDom = document.getElementById('canvas')
      if(!chartDom){
        return
      }
      this.myChart && this.myChart.dispose()
      if(result.length === 0){
        chartDom.innerHTML = this.$t('com_no_content')
        return
      }
      let newResult = {}
      result.forEach(v=>{
        if(newResult[v.R2R_PARA]){
          newResult[v.R2R_PARA].push(v)
        }else{
          newResult[v.R2R_PARA] = [v]
        }
      })
      let series = []
      for(let R2RPARA in newResult){
        let R2RPARADATA = []
        R2RPARADATA.push([this.searchParams.R2R_TIME_BEGIN,null])
        newResult[R2RPARA] && newResult[R2RPARA].forEach(m=>{
          let newArr = [m.R2R_TIME,m.R2R_VAL,m.ID]
          R2RPARADATA.push(newArr)
        })
        R2RPARADATA.push([this.searchParams.R2R_TIME_END,null])
        const part = {
          name: R2RPARA,
          type: "line",
          data:R2RPARADATA
        }
        series.push(part)
      }
      const options = {...newOptions,legend:{...newOptions.legend,data:Object.keys(newResult)},series}
      options.tooltip = {
        ...option.tooltip,
        formatter:(data)=>{return this.formatter(data)}
      }
      this.myChart = echarts.init(chartDom) 
      this.myChart.setOption(options)
    },
    // tooltip 提示文案
    formatter(data){
      const id = data.data && data.data.length > 2 ? data.data[2] : ''
      const currentData = this.tableOptions.data.find(v=>v.ID === id) || {}
      const lot = this.$t('v_report_r2r_lot') + (currentData.R2R_LOT_ID || '')
      const time = this.$t('v_report_r2r_time') + (currentData.R2R_TIME || '')
      const para = this.$t('v_report_r2r_para') + (currentData.R2R_PARA || '')
      const value = this.$t('v_report_r2r_value') + (currentData.R2R_VAL || '')
      const waferId = this.$t('v_report_substrate_id') + (currentData.SUBSTRATE_ID || '')
      const resultCode = this.$t('v_report_r2r_result_code') + (currentData.R2R_RESULT_CODE || '')
      const result = `<div class=font-12>
        ${(time + '<br/>') }
        ${para + '<br/>'}
        ${value + '<br/>'}
        ${lot + '<br/>'}
        ${waferId + '<br/>'}
        ${resultCode}
      </div>`
        return result
    }
  },
  mounted(){
    getTableHeight.call(this,102)
    window.onresize = () => {
      this.myChart && this.myChart.resize()
    }
  },
  beforeDestroy(){
    this.myChart && this.myChart.dispose()
  }
}
</script>
<style lang="scss" scoped>
.device-parameter{
  display: flex;
  flex-direction: column;
  #canvas{
    min-height: 220px;
    height: 100%;
    flex: 1;
  }
  .canvas-no-content{
    border-radius: 10px;
    border: 1px solid #ececec;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00678e
  }
}
</style>
