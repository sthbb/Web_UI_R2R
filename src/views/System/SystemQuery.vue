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
        :visible.sync="addQuery"
        width="50%"
        :append-to-body="true"
        :before-close="()=>{addQuery = false}"
      >
        <span slot="title">
          <div class="diolag-box" :style="{background:$root.theme}">
            <div>{{queryData.type ? $t('v_dialog_title_edit_query') : $t('v_dialog_title_add_query')}}</div>
          </div>
        </span>
        <BaseTableForm :ruleForm="queryData" :tableColumn="tableColumn" ref="addForm"/>
        <span slot="footer">
          <el-button @click="addQuery = false">{{$t('btn_cancel')}}</el-button>
          <el-button type="primary" @click="addConfirm()">{{$t('btn_confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import BaseTableForm from "@/component/BaseTableForm"
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,toCancelEdit,resetSubmit,toResetTableStatus,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
import { axiosParams,objValueIsNull,getFinallyData,searchRequireParams } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    BaseTableForm,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID :"SYS_QUERY",
      isCollapse: false,
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'QUERY_ID',
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[]
      },
      addQuery:false,
      queryData:{},
      tableColumn:[],
      actions:[],
      editData:[]
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('System/SystemQuery')
    async init(){
      loadSearchColumns.call(this)
      await loadColumns.call(this)
      this.tableColumn = [...this.tableOptions.columns]
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
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
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
    // 清除表单验证
    clearValidate(){
      this.$nextTick(()=>{
        this.$refs?.addForm?.$refs?.ruleForm.clearValidate()
      })
    },
    //加载列表数据
    async load(params = this.searchParams,type='SYSQUERY_MANAGEMENT#select',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'SYSQUERY_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          isUpdateSignalID === undefined && loadSearchColumns.call(this,true)
          this.toAdd(false,false,isUpdateSignalID)
        }
        return
      }
      const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      this.editData = result.map(v=>Object.assign({},v))
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
    add(){
      let DISP_SEQ = this.tableOptions.data.length
      this.queryData= {...searchRequireParams(this.searchForm,this.searchParams),tableType:'add',ROW_NUM:++DISP_SEQ}
      this.switchArr.forEach(v=>{
        this.$set(this.menuData,v,false)
      })
      this.addQuery = true
      this.clearValidate()
    },
    //新增确认
    addConfirm(){
      if(this.$refs.addForm && this.$refs.addForm.$refs.ruleForm){
        this.$refs.addForm.$refs.ruleForm.validate(async (valid)=>{
          if(!valid){
            return 
          }
          const data = axiosParams([{...this.queryData}],this.switchArr,this.numberArr,this.specialkeyArr)
          await this.load(data,data[0].tableType === 'edit' ? 'SYSQUERY_MANAGEMENT#update' : 'SYSQUERY_MANAGEMENT#save')
          this.addQuery = false
        })
      }
    },
    //编辑
    @getHasPrivTip('U')
    toEdit(rowIndex){
      this.queryData = {...this.tableOptions.data[rowIndex],type:'edit',tableType:'edit'}
      console.log(this.queryData)
      this.addQuery = true
      this.clearValidate()
    },
    // 删除
    @getHasPrivTip('D')
    @deleteValidata()
    async toDel(data) {
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(m=>{return {[this.tableOptions.id]:m[this.tableOptions.id],DB_TYPE:m.DB_TYPE,QUERY_VER:m.QUERY_VER}}) :  [{[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id],DB_TYPE:this.tableOptions.data[data].DB_TYPE,QUERY_VER:this.tableOptions.data[data].QUERY_VER}]
      this.load(delIds, 'SYSQUERY_MANAGEMENT#delete')
    }
  }
}
</script>