<template>
    <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" @reset="(data)=>{searchFn(data,2)}" ref="searchRef" labelWidth="101px"/>
          </template>
        </div>
        <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
          <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
        </span>
      </div>
      <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
        <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef" :mergeCells="mergeCells"/>
      </div>
      <el-dialog
        :visible.sync="dialogVisible"
        width="80%"
        :append-to-body="true"
        :before-close="()=>{cancelConfirm()}"
      >
        <span slot="title">
          <div class="diolag-box" :style="{background:$root.theme}">
            <div>{{showReqDetail ? $t('v_dialog_title_req_detail') : $t('v_dialog_title_r2r_result_code')}}</div>
          </div>
        </span>
        <BaseTable :tableOptions="baseProps"/>
        <span slot="footer">
          <el-button type="primary" @click="cancelConfirm">{{$t('btn_close')}}</el-button>
        </span>
      </el-dialog>
    </div>

</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import moment from 'moment'
import { getHasPrivTip,getFuncID,searchValidata,addValidate } from '@/commn/decoratorFn'
import {objValueIsNull,getSearchLimitTime,getFinallyData,getColMap,resetParams,getTableType,formatParam } from '@/commn/commonFn'
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
      GRID_ID:"R2R_HISTORY",
      isCollapse: false,
      timeArr:[],
      switchArr:[],
      tableOptions: {
        id: "R2R_MODEL_KEY",
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons: [],
        },
        actions:[]
      },
      tableData:[],
      referceInfo:{},
      dialogVisible:false,
      showReqDetail:false,
      limitTime:7,
      startTime:'',
      endTime:'',
      modalTime:[],
      modelSwitch:[],
      baseProps:{
        toolbarConfig:{
          import: false,
          export: false,
          print: false,
          zoom: false,
          custom: false,
          refresh:false,
          buttons:[]
        },
        columns:[],
      },
      mergeCells:[]
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Histrory/R2RHistory')
    async init(){
      this.limitTime = +(await getSearchLimitTime({ENUM_ID:'SEARCH_PERIOD_R2R_HIST',FAC_ID:this.searchParams.FAC_ID}) || '7')
      loadColumns.call(this)
      await loadSearchColumns.call(this)
      this.startTime = moment(new Date()).subtract('days',this.limitTime - 1).format('YYYY-MM-DD 00:00:00')
      this.endTime = moment(new Date()).format("YYYY-MM-DD 23:59:59")
      this.searchParams = {...this.searchParams,REQUEST_TIME_END:this.endTime,REQUEST_TIME_BEGIN:this.startTime}
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["page",() => {this.toSearch(false)}],
        ["cell",() => {this.toDetail(data.data)}],
        ["detail",() => {this.toDetail(data.data)}],
        ["jumpmodelspec",() => {this.toModelSpec(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : resetSubmit.call(this,{...data,REQUEST_TIME_END:this.endTime,REQUEST_TIME_BEGIN:this.startTime})
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
    async load(params = this.searchParams,type='LOTTRX_MANAGEMENT#selectWithReq'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type === 'REQEXTTRX_MANAGEMENT#select'){
        this.baseProps.data = formatParam((res.DATA||[]),this.modalTime,this.modelSwitch).map((v,i)=>{return {...v,ROW_NUM:i+1}})
        return 
      }
      if(type === 'CODE_MANAGEMENT#select'){
        this.baseProps.data = formatParam((res.DATA||[]),this.modalTime,this.modelSwitch).map((v,i)=>{return {...v,ROW_NUM:i+1}})
        return 
      }
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams).map(v=>{return {...v,ID:Math.random()*100}})
      clearSort.call(this)
      // 同一个lot发起批量请求
      const lotIds = new Map()
      const hasRowNum = this.tableOptions.columns.findIndex(v=>v.COL_NAME === 'ROW_NUM') > -1
      const lotIdIndex = this.tableOptions.columns.findIndex(v=>v.COL_NAME === 'LOT_ID')
      this.tableOptions.data.forEach(v=>{
        lotIds.has(v.LOT_ID) ? lotIds.set(v.LOT_ID, [...lotIds.get(v.LOT_ID),...[v]]) : lotIds.set(v.LOT_ID, [v])
      })
      for (const value of lotIds.values()) {
        const timeMap = new Map()
        value.forEach(m=>{
          timeMap.has(m.REQUEST_TIME) ? timeMap.set(m.REQUEST_TIME, [...timeMap.get(m.REQUEST_TIME),...[m]]) : timeMap.set(m.REQUEST_TIME, [m])
        })
        for(const [key,time] of timeMap.entries()){
          if(time.length > 1){//说明时间有重叠
            time.forEach((v,i)=>{
              i > 0 ? v.IsResetNull = true : ''
            })
            const first = this.tableOptions.data.findIndex(v=>v.ID === time[0].ID)
            const last = this.tableOptions.data.findIndex(v=>v.ID === time[time.length - 1].ID)
            for(let i = (hasRowNum ? 1 : 0);i<=lotIdIndex;i++){
              this.mergeCells.push({ row: first, col: i, rowspan: last - first + 1, colspan: 1 })
            }
          }
        }
      }
    },
    // 详情点击
    toDetail(data){
      const cellArr = new Map([
        ['R2R_PARA',()=>{this.toReqDetail(this.tableOptions.data[data.rowIndex])}],
        ['R2R_RESULT_CODE',()=>{this.toR2RResultCode(this.tableOptions.data[data.rowIndex])}],
      ])
      cellArr.get(data.name) && cellArr.get(data.name)()
    },
    // req detail
    async toReqDetail(data){
      await this.getAllColumns(1)
      await this.load({REQ_TRX_KEY:data.REQ_TRX_KEY},'REQEXTTRX_MANAGEMENT#select')
      this.dialogVisible = true
      this.showReqDetail = true
    },
    // to model Spec
    toModelSpec(index){
      const data = this.tableOptions.data[index]
      sessionStorage.setItem("jumpParams",JSON.stringify({FAC_ID:data.FAC_ID,AREA_ID:data.AREA_ID,EQP_ID:data.EQP_ID,RECIPE_ID:data.RECIPE_ID}))
      this.$router.push({path:'/R2RSpec'})
    },
    // r2r result code
    async toR2RResultCode(){
      await this.getAllColumns(2)
      await this.load({FAC_ID:this.searchParams.FAC_ID,AREA_ID:this.searchParams.AREA_ID,CODE_GRP_ID:'R2R_RESULT_CODE',CODE_TYPE:'R2R_RESULT'},'CODE_MANAGEMENT#select')
      this.dialogVisible = true
    },
    //columns
    async getAllColumns(type = 1){
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID: type === 1 ? 'R2R_HISTORY_POP_REQ_DETAIL' : 'R2R_HISTORY_POP_RESULT_CODE',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      const tableTypeResult = getTableType(columns)
      this.modalTime = tableTypeResult.timeArr
      this.modelSwitch = tableTypeResult.switchArr
      this.baseProps.columns = columns
    },
    // 取消模态框操作
    cancelConfirm(){
      this.dialogVisible = false
      this.showReqDetail = false
    }
  }
}
</script>
