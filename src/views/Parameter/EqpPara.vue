<template>
  <div class="device-parameter-contain">
    <div class="common-search-contain" v-if="searchForm.length > 0">
      <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']" >
        <template>
          <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
          <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" @reset="(data)=>{searchFn(data,2)}" ref="searchRef" :showEqpId="true" labelWidth="126px"/>
        </template>
      </div>
      <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
        <i
          :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"
        ></i>
      </span>
    </div>
    <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
      <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef"/>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="50%"
      :append-to-body="true"
      :before-close="()=>{dialogVisible = false}"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{$t('v_dialog_title_view_history')}}</div>
        </div>
      </span>
      <ViewHistory ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="EQPPARAHIST_MANAGEMENT#select" />
      <span slot="footer">
        <el-button type="primary" @click="dialogVisible = false">{{$t('btn_close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTable from "@/component/BaseTable"
import BaseTitle from "@/component/BaseTitle"
import ViewHistory from '../R2RSpec/component/ViewHistory'
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,filterAll,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
import { axiosParams,objValueIsNull,importFilterFiled,searchRequireParams,getFinallyData} from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    ViewHistory,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      isCollapse: false,
      FUNC_ID :"",
      GRID_ID:'EQP_PARA',
      specialkeyArr:[], //编辑时候 特殊参数
      timeArr:[],//时间格式
      switchArr:[],//switch集合
      numberArr:[],//number类型集合
      tableOptions: {
        id: "EQP_PARA_KEY",
        columns: [],
        data: [],
        exportTitle:'',
        toolbarConfig:{
          buttons: []
        },
        actions:[]
      },
      actions:[],
      editData:[],
      dialogVisible:false
    }
  },
  async created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Parameter/EqpPara')
    init(){
      loadSearchColumns.call(this)
      loadColumns.call(this)
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : resetSubmit.call(this,data,[])
    },
    //准备搜索
    @addValidate()
    toSearch(reloadSearchData,isUpdateSignalID){
      this.searchSubmit(undefined,reloadSearchData,isUpdateSignalID)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true,isUpdateSignalID){
      this.searchParams = {...this.searchParams,...data}
      reloadSearchData && await loadColumns.call(this)
      this.load(undefined,undefined,isUpdateSignalID)
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data,[])}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.toSearch(false)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["history",() => {this.toHistory(data.data)}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this,[])}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    //加载列表数据
    async load(params = this.searchParams,type='EQPPARA_MANAGEMENT#select',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'EQPPARA_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          this.toSearch(false,isUpdateSignalID)
        }
        return
      }
      const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      this.editData = result.map(v=>Object.assign({},v))
      if(isUpdateSignalID !== undefined){// 保存单条数据并更新成最新数据
        saveSignlData.call(this,isUpdateSignalID,result) 
        return
      }
      this.tableOptions.data = result
      this.initUnimport()
      resetData.call(this,[])
    },
    //未导入的模板
    async initUnimport(){
      const { modelParaList } = this.$api.parameter
      let res = await modelParaList({...this.searchParams},'EQPPARA_MANAGEMENT#selectPara')
      res = getFinallyData((res.DATA || []),this.timeArr,this.switchArr,this.numberArr)
      if(res.length > 0){
        filterAll.call(this,[],['save','cancel'],true,false,true)
        res.forEach(element => {
          importFilterFiled.forEach(m=>{
            element[m] = null
          })
          this.tableOptions.data.unshift({...searchRequireParams(this.searchForm,this.searchParams),...element,tableType:'add',checked:true,disabled:true,EQP_ID:this.searchParams.EQP_ID,USE_YN:true,ROW_NUM:element.DISP_SEQ})
        })
      }
      clearSort.call(this)
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
      this.load(delIds, 'EQPPARA_MANAGEMENT#delete')
    },
    // 保存
    @getHasPrivTip('D','hasModel')
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? 'EQPPARA_MANAGEMENT#save' : 'EQPPARA_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    // 历史
    async toHistory(index){
      const key = this.tableOptions.id
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.viewHistory.initData({[key]:this.tableOptions.data[index][key]})
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-menu{
  width: 318px;
}
.el-menu--collapse.el-menu{
  width: 0;
}
</style>
