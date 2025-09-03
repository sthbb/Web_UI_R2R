<template>
    <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="searchFn"  @submit="searchSubmit" @reset="resetSubmit" ref="searchRef" labelWidth="91px"/>
          </template>
        </div>
        <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
          <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
        </span>
      </div>
      <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
        <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef"/>
      </div>
      <el-dialog
        :visible.sync="dialogVisible"
        width="80%"
        :append-to-body="true"
        :before-close="()=>{cancelConfirm()}"
      >
        <span slot="title">
          <div class="diolag-box" :style="{background:$root.theme}">
            <div>{{showHistory ? $t('v_dialog_title_view_history') : $t('v_dialog_title_manual_filtering')}}</div>
          </div>
        </span>
        <ViewHistory v-if="showHistory" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="REFFILTERTRXHIST_MANAGEMENT#select" />
        <BaseSearch :data="tableColumn" :params="manualFilteringData" @emitChild="(data)=>{searchFn(data,true)}" ref="ManualFiltering" labelWidth="100px" :hiddenSearchButton="true"/>
        <span slot="footer">
          <el-button type="primary" v-if="showHistory" @click="cancelConfirm">{{$t('btn_close')}}</el-button>
          <template v-else>
            <el-button @click="cancelConfirm">{{$t('btn_cancel')}}</el-button>
            <el-button type="primary" @click="addConfirm">{{$t('btn_confirm')}}</el-button>
          </template>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import ViewHistory from '../R2RSpec/component/ViewHistory'
import BaseTableForm from '@/component/BaseTableForm'
import { getHasPrivTip,getFuncID,searchValidata,addValidate,saveValidate,deleteValidata } from '@/commn/decoratorFn'
import moment from 'moment'
import {columnsCellShow,axiosParams,objValueIsNull,getSearchLimitTime,searchRequireParams,getFinallyData,selectChangeSetting,getColMap,searchFormSetting,resetParams } from '@/commn/commonFn'
import {loadColumns,keepSort,clearSort,resetData,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,addData,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
export default {
  components: {
    BaseSearch,
    BaseTable,
    ViewHistory,
    BaseTableForm,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      manualFilteringData:{},
      FUNC_ID :"",
      GRID_ID:"REF_FILTER",
      isCollapse: false,
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id: "FILTER_TRX_KEY",
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons: [{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[]
      },
      editData:[],
      dialogVisible:false,
      showHistory:false,
      limitTime:7,
      actions:[],
      startTime:'',
      endTime:'',
      tableColumn:[]
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Context/ReferenceFilter')
    async init(){
      this.limitTime = +(await getSearchLimitTime({ENUM_ID:'SEARCH_PERIOD_REF_FILTER',FAC_ID:this.searchParams.FAC_ID}) || '7')
      loadColumns.call(this)
      await loadSearchColumns.call(this)
      this.startTime = moment(new Date()).subtract('days',this.limitTime - 1).format('YYYY-MM-DD 00:00:00')
      this.endTime = moment(new Date()).format("YYYY-MM-DD 23:59:59")
      this.searchParams = {...this.searchParams,CREATE_TIME_END:this.endTime,CREATE_TIME_BEGIN:this.startTime}
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.toAdd(false,false)}],
        ["history",() => {this.toHistory(data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 重置搜索条件
    resetSubmit(data){
      resetSubmit.call(this,{...data,CREATE_TIME_END:this.endTime,CREATE_TIME_BEGIN:this.startTime})
    },
    // 搜索的change事件
    async searchFn(item,isMadel=false){
      let data = [...(isMadel ? this.tableColumn : this.searchForm )]
      let params = {...(isMadel ? this.manualFilteringData : this.searchParams)}
      const areaIdSeq = +(data.find(v=>v.COL_NAME === 'AREA_ID').COL_DISP_SEQ)
      const currentSeq = +(data.find(v=>v.COL_NAME === item.key).COL_DISP_SEQ) // 当前key的序号
      if(item.key === 'AREA_ID' || currentSeq < areaIdSeq){
        data = await columnsCellShow(data,params,true) 
      }
      const res = await selectChangeSetting(item.key,data,params)
      data = res.data
      params = {...params,...res.params} 
      if(!isMadel){
        this.searchForm = data
        this.searchParams = params
      }else{
        this.tableColumn = data
        this.manualFilteringData = params
      }
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true,isUpdateSignalID){
      reloadSearchData && await loadColumns.call(this)
      this.load(undefined,undefined,isUpdateSignalID)
    },
    //加载列表数据
    async load(params = this.searchParams,type='REFFILTERTRX_MANAGEMENT#select',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'REFFILTERTRX_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          // isUpdateSignalID === undefined && this.loadSearchColumns.call(this,true)
          this.toAdd(false,false,isUpdateSignalID)
        }
        return
      }
      const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      this.editData = result.map(v=>Object.assign({},v))
      if(isUpdateSignalID !== undefined){ // 保存单条数据并更新成最新数据
        saveSignlData.call(this,isUpdateSignalID,result)
        return 
      }
      this.tableOptions.data = result
      resetData.call(this)
      clearSort.call(this)
    },
    //准备新增
    @addValidate()
    toAdd(isAdd=true,reloadSearchData,isUpdateSignalID){
      isAdd ? this.add() : this.searchSubmit(undefined,reloadSearchData,isUpdateSignalID)
    },
    // 清除表单验证
    clearValidate(){
      this.$nextTick(()=>{
        this.$refs?.ManualFiltering?.$refs?.ruleForm.clearValidate()
      })
    },
    // 新增
    @getHasPrivTip('C')
    async add(){
      this.manualFilteringData = {...searchRequireParams(this.searchForm,this.searchParams),FILTER_YN:true,tableType:'add'}
      let searchForm = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'REF_FILTER_POP',
        SEARCH_DISP_YN:'Y'
      })
      const res =  await searchFormSetting(resetParams((searchForm || []),true),this.manualFilteringData,true) 
      this.tableColumn = await columnsCellShow(res.data,this.manualFilteringData,true) 
      this.dialogVisible = true
      this.clearValidate()
    },  
    // 确认新增
    async addConfirm(){
      const valid = await this.$refs.ManualFiltering?.$refs.ruleForm.validate()
      if(!valid){
        return 
      }
      addData.call(this,['add','save'],this.manualFilteringData)
      keepSort.call(this)
      this.dialogVisible = false
    },
    // 取消模态框操作
    cancelConfirm(){
      this.dialogVisible = false
      this.showHistory = false
      this.manualFilteringData = {}
    },
    //编辑
    @getHasPrivTip('U')
    async toEdit(rowIndex){
      comEdit.call(this,rowIndex,['edit'],['save'])
    },
    // 删除
    @getHasPrivTip('D')
    @deleteValidata()
    async toDel(data) {
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {[this.tableOptions.id]:v[this.tableOptions.id]}}) : {[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id]}
      this.load(delIds, 'REFFILTERTRX_MANAGEMENT#delete')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? 'REFFILTERTRX_MANAGEMENT#saveWebApi' : 'REFFILTERTRX_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    // 历史
    async toHistory(index){
      const key = this.tableOptions.id
      this.showHistory = true
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.viewHistory.initData({[key]:this.tableOptions.data[index][key]})
      })
    }
  }
}
</script>
