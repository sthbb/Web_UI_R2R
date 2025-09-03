<template>
    <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" @reset="(data)=>{searchFn(data,2)}" ref="searchRef" labelWidth="100px"/>
          </template>
        </div>
        <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
          <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
        </span>
      </div>
      <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
        <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef"/>
      </div>
    </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import moment from 'moment'
import { getHasPrivTip,getFuncID,searchValidata,addValidate } from '@/commn/decoratorFn'
import {objValueIsNull,getSearchLimitTime,getFinallyData } from '@/commn/commonFn'
import {loadColumns,clearSort,loadSearchColumns,resetSubmit,searchFn,getTableHeight } from '@/commn/comTable'
export default {
  components: {
    BaseSearch,
    BaseTable,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID:"ALARM_HISTORY",
      isCollapse: false,
      timeArr:[],
      switchArr:[],
      tableOptions: {
        id: "ALARM_TRX_KEY",
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons: [],
        },
        actions:[]
      },
      limitTime:7,
      actions:[],
      startTime:'',
      endTime:''
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Histrory/AlarmHistory')
    async init(){
      this.limitTime = +(await getSearchLimitTime({ENUM_ID:'SEARCH_PERIOD_ALARM_HIST',FAC_ID:this.searchParams.FAC_ID}) || '7')
      loadColumns.call(this)
      await loadSearchColumns.call(this)
      this.startTime = moment(new Date()).subtract('days',this.limitTime - 1).format('YYYY-MM-DD 00:00:00')
      this.endTime = moment(new Date()).format("YYYY-MM-DD 23:59:59")
      this.searchParams = {...this.searchParams,CREATE_TIME_END:this.endTime,CREATE_TIME_BEGIN:this.startTime}
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["page",() => {this.toSearch(false)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : resetSubmit.call(this,{...data,CREATE_TIME_END:this.endTime,CREATE_TIME_BEGIN:this.startTime})
    },
    //准备搜索
    @addValidate()
    toSearch(reloadSearchData){
      this.searchSubmit(undefined,reloadSearchData)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    //加载列表数据
    async load(params = this.searchParams,type='ALARMTRX_MANAGEMENT#select'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      clearSort.call(this)
    }
  }
}
</script>
