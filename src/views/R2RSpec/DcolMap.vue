<template>
    <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" @reset="(data)=>{searchFn(data,2)}" ref="searchRef"/>
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
        :width="showHistory ? '80%' :'50%'"
        :append-to-body="true"
        :before-close="()=>{cancelConfirm()}"
      >
        <span slot="title">
          <div class="diolag-box" :style="{background:$root.theme}">
            <div>{{showHistory ? $t('v_dialog_title_view_history') : $t('v_dialog_title_add_para')}}</div>
          </div>
        </span>
        <ViewHistory v-if="showHistory" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="DCOLMAPHIST_MANAGEMENT#select" />
        <AddPara v-else :searchParams="searchParams" ref="addPara" :tableData="tableData" />
        <span slot="footer">
          <el-button v-if="!showHistory" @click="cancelConfirm">{{$t('btn_cancel')}}</el-button>
          <el-button v-if="!showHistory" type="primary" @click="()=>{comAddPara.call(this)}">{{$t('btn_confirm')}}</el-button>
          <el-button v-if="showHistory" type="primary" @click="cancelConfirm">{{$t('btn_close')}}</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import ViewHistory from './component/ViewHistory'
import AddPara from './component/AddPara.vue'
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,selectChange,searchFn,getTableHeight,comAddPara,comInitUnimport } from '@/commn/comTable'
import {axiosParams,objValueIsNull,getFinallyData  } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    ViewHistory,
    AddPara,
    BaseTitle
  },
  data() {
    return {
      comAddPara,
      searchForm:[],
      searchParams:{
        R2R_MODEL_NAME:'DCOL_MAP'
      },
      FUNC_ID :"",
      GRID_ID :"DCOL_MAP",
      isCollapse: false,
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id: "DCOL_MAP_KEY",
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{
        },
        actions:[]
      },
      editData:[],
      dialogVisible:false,
      selectData:[],
      tableData:{},
      showHistory:false,
      actions:[]
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('R2RSpec/DcolMap')
    init(){
      loadSearchColumns.call(this)
      loadColumns.call(this)
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.toAdd(false,false)}],
        ["history",() => {this.toHistory(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : resetSubmit.call(this,{...data,R2R_MODEL_NAME:'DCOL_MAP'})
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true,isUpdateSignalID){
      this.searchParams = {...this.searchParams,...data}
      reloadSearchData && await loadColumns.call(this)
      this.load(undefined,undefined,isUpdateSignalID)
    },
    //加载列表数据
    async load(params = this.searchParams,type='DCOLMAP_MANAGEMENT#selectWebApi',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'DCOLMAP_MANAGEMENT#selectWebApi'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          // isUpdateSignalID === undefined && loadSearchColumns.call(this,true)
          this.toAdd(false,false,isUpdateSignalID)
        }
        return
      }
      const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams).map(v=>{return {...v,R2R_MODEL_NAME:this.searchParams.R2R_MODEL_NAME}})
      this.editData = result.map(v=>Object.assign({},v))
      if(isUpdateSignalID !== undefined){ // 保存单条数据并更新成最新数据
        saveSignlData.call(this,isUpdateSignalID,result)
        return 
      }
      this.tableOptions.data = result
      clearSort.call(this)
      resetData.call(this)
    },
    //准备新增
    @addValidate()
    toAdd(isAdd=true,reloadSearchData,isUpdateSignalID){
      isAdd ? this.add() : this.searchSubmit(undefined,reloadSearchData,isUpdateSignalID)
    },
    // 新增
    @getHasPrivTip('C')
    async add(){
      await comInitUnimport.call(this,'DCOL_MAP_POP_ADD_PARA')
      this.dialogVisible = true
    },
    // 取消模态框操作
    cancelConfirm(){
      this.dialogVisible = false
      this.showHistory = false
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
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {[this.tableOptions.id]:v[this.tableOptions.id]}}) :  {[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id]}
      this.load(delIds, 'DCOLMAP_MANAGEMENT#delete')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? 'DCOLMAP_MANAGEMENT#saveWebApi' : 'DCOLMAP_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
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
