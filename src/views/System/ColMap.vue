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
      width="80%"
      :append-to-body="true"
      :before-close="()=>{dialogVisible = false}"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{$t('com_column_setting')}}</div>
        </div>
      </span>
      <ColSetting :colSettingData="colSettingObj" ref="colSetting" @change="confirmSetting"/>
      <span slot="footer" v-if="tableOptions.data.length>0 && tableOptions.data[opeIndex].tableType">
        <el-button @click="dialogVisible = false">{{$t('btn_close')}}</el-button>
        <el-button @click="$refs.colSetting.clearAll()">{{$t('btn_cancel_all')}}</el-button>
        <el-button type="primary" @click="()=>{$refs.colSetting.confirm()}">{{$t('btn_confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTable from "@/component/BaseTable"
import BaseTitle from "@/component/BaseTitle"
import ColSetting from "@/component/ColSetting"
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,addData,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
import { axiosParams,objValueIsNull,getFinallyData } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    BaseTitle,
    ColSetting
  },
  data() {
    return {
      searchForm:[],
      FUNC_ID :"",
      GRID_ID :"COL_MAP",
      isCollapse: false,
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'ID',
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[],
      },
      actions:[],
      editData:[],
      colSettingObj:{},
      opeIndex:0,
      dialogVisible:false
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('System/ColMap')
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
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["cell",() => {this.toCell(data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : resetSubmit.call(this,data)
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
    async load(params = this.searchParams,type='COLMAP_MANAGEMENT#select',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'COLMAP_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          isUpdateSignalID === undefined && loadSearchColumns.call(this,true)
          this.toAdd(false,false,isUpdateSignalID)
        }
        return
      }
      const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams).map(v=>{return {...v,ID:v.FUNC_ID+v.GRID_ID+v.COL_NAME}})
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
      addData.call(this,['add','save'])
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
      let delIds =  data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {FUNC_ID:v.FUNC_ID,GRID_ID:v.GRID_ID,COL_NAME:v.COL_NAME}}) :  {FUNC_ID:this.tableOptions.data[data].FUNC_ID,GRID_ID:this.tableOptions.data[data].GRID_ID,COL_NAME:this.tableOptions.data[data].COL_NAME}
      this.load(delIds, 'COLMAP_MANAGEMENT#delete')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) :[{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr,false)
      this.load(filterData, filterData[0].tableType === 'add' ? 'COLMAP_MANAGEMENT#save' : 'COLMAP_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    //单元格点击
    toCell(data){
      const cellArr = new Map([
        ['COL_TYPE',()=>{this.toColSetting(data.rowIndex,data.name)}],
        ['SEARCH_RENDER_TYPE',()=>{this.toColSetting(data.rowIndex,data.name)}]
      ])
      cellArr.get(data.name) && cellArr.get(data.name)()
    },
    //单元格设置
    toColSetting(index,name){
      this.dialogVisible = true
      this.opeIndex = index
      const data = {...this.tableOptions.data[index],isSearch:name === 'SEARCH_RENDER_TYPE',HAS_AREA_ID:[]}
      data.HAS_ACTION_BAR = !data.isSearch && data.COL_NAME === 'ACTION_BAR'
      if(!data.isSearch && data.COL_TYPE){
        data.HAS_COL_TYPE = JSON.parse(data.COL_TYPE)
      }
      if(!data.isSearch && data.COL_DATA_COND){
        data.COL_DATA_COND = JSON.parse(data.COL_DATA_COND)
      }
      if(data.isSearch && data.SEARCH_RENDER_TYPE){
        data.SEARCH_RENDER_TYPE = JSON.parse(data.SEARCH_RENDER_TYPE)
      }
      if(data.isSearch && data.SEARCH_DATA_COND){
        data.SEARCH_DATA_COND = JSON.parse(data.SEARCH_DATA_COND)
      }
      if(data.HAS_ACTION_BAR){ //操作栏回显
        data.HAS_ACTION_BARS = data.HAS_COL_TYPE ? data.HAS_COL_TYPE.map(v=>{return {...v,checked:true}}) : []
      }
      if(!data.HAS_ACTION_BAR && data.HAS_COL_TYPE && data.HAS_COL_TYPE.buttons){// button回显
        data.HAS_BUTTON =true
        data.HAS_BUTTON_DISPLAY =true
        data.HAS_BUTTON_EDIT =true
        data.HAS_DISPICON = data.HAS_COL_TYPE.buttons.dispicon || {}
        data.HAS_OPEICON = data.HAS_COL_TYPE.buttons.opeicon || {}
      }
      if(!data.HAS_ACTION_BAR){
        if(data.isSearch){
          data.HAS_COL_TYPE = data.SEARCH_RENDER_TYPE && data.SEARCH_RENDER_TYPE.name ? data.SEARCH_RENDER_TYPE.name.toLowerCase() :'input'
        }else{
          data.HAS_COL_TYPE =  data.HAS_COL_TYPE && data.HAS_COL_TYPE.name ? data.HAS_COL_TYPE.name.toLowerCase() : 'text'
        }
      }
      if(data.isSearch && !data.HAS_ACTION_BAR && data.SEARCH_DATA_COND){//搜索条件回显
        data.HAS_AREA_ID = data.SEARCH_DATA_COND.AREA_ID || []
      }
      if(!data.isSearch && !data.HAS_ACTION_BAR && data.COL_DATA_COND){ //列表条件回显
        data.HAS_AREA_ID = data.COL_DATA_COND.AREA_ID || []
        data.HAS_PATTERN = data.COL_DATA_COND.PATTERN || ''
        data.HAS_MESSAGE = data.COL_DATA_COND.MESSAGE || ''
        data.HAS_MAX = data.COL_DATA_COND.MAX || ''
        data.HAS_MIN = data.COL_DATA_COND.MIN || ''
        data.HAS_COL_CONTROL_YN = data.COL_DATA_COND.COL_CONTROL_YN ? (data.COL_DATA_COND.COL_CONTROL_YN.toLowerCase() === 'y' || false) : false
        data.HAS_USED_NO_EDIT = data.COL_DATA_COND.USED_NO_EDIT ? (data.COL_DATA_COND.USED_NO_EDIT.toLowerCase() === 'y' || false) : false
      }
      if(!data.HAS_ACTION_BAR && data.BIND_DISP_COLS){// 下拉框回显
        const items = data.BIND_DISP_COLS.split(",")
        data.HAS_BIND_QUERY_NAME = items.length > 0 ? items[0] || '' : '' 
        data.HAS_BIND_TIP_NAME = items.length > 1 ? items[1] || '' : ''
        data.HAS_BIND_QUERY_EXTRAl_NAME = items.length > 2 ? items[2] || '' : ''
      }
      //数据回显逻辑
      this.colSettingObj = data
    },
    //设置confirm 
    confirmSetting(data){
      const newData = {...this.tableOptions.data[this.opeIndex],...data}
      this.dialogVisible = false
      this.$set(this.tableOptions.data,this.opeIndex,newData)
    }
  }
}
</script>