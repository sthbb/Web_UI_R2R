<template>
  <div class="device-parameter-contain">
    <div class="common-search-contain" v-if="searchForm.length > 0">
      <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
        <template>
          <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
          <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" ref="searchRef" :showEqpId="true" labelWidth="126px" @reset="(data)=>{searchFn(data,2)}"/>
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
      width="50%"
      :append-to-body="true"
      :before-close="()=>{dialogVisible = false,showHistory=false}"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{showHistory ? $t('v_dialog_title_view_history') : $t('v_dialog_title_copy')}}</div>
        </div>
      </span>
      <ViewHistory v-if="showHistory" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="PARAHIST_MANAGEMENT#select" />
      <template v-else>
        <BaseTitle :title="`${$t('c_vendor_eqp_model')} - ${$t('v_dialog_title_source')}: ${this.searchParams.VENDOR_EQP_MODEL}`" />
        <BaseTransfer
          class="m-t-10"
          :leftBaseProps="leftBaseProps"
          :rightBaseProps="rightBaseProps"
          :title="{right: `${$t('c_vendor_eqp_model')+' - '+$t('v_dialog_title_destination')}`}"
          :showSource="false"
          @selects="(data)=>{selects = data}"
          ref="transfer"
        />
      </template>
      <span slot="footer">
        <el-button v-if="!showHistory" @click="dialogVisible = false">{{$t('btn_cancel')}}</el-button>
        <el-button v-if="!showHistory" type="primary" @click="confirmCopy" :disabled="selects.length === 0">{{$t('btn_confirm')}}</el-button>
        <el-button v-if="showHistory" type="primary" @click="dialogVisible = false,showHistory=false">{{$t('btn_close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import BaseTransfer from "@/component/BaseTransfer";
import ViewHistory from '../R2RSpec/component/ViewHistory'
import { confirmTip,getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,addData,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
import {getColMap,resetParams,formatParam,axiosParams,objValueIsNull,getTableType,getFinallyData } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    BaseTransfer,
    ViewHistory,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID:'MODEL_PARA',
      isCollapse: false,
      specialkeyArr:[], //编辑时候 特殊参数
      timeArr:[],//时间格式
      switchArr:[],//switch集合
      numberArr:[],//number类型集合
      tableOptions: {
        id: "PARA_KEY",
        columns: [],
        data: [],
        exportTitle:'',
        toolbarConfig:{
          buttons:[
            { code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"},
            { code: "copy", name: 'btn_copy', icon: "el-icon-document-copy"}
          ]
        },
        actions:[]
      },
      actions:[],
      editData:[],
      dialogVisible:false,
      leftBaseProps:{},
      rightBaseProps:{},
      selects:[],
      showHistory:false
    }
  },
  async created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    //初始化
    @getFuncID('Parameter/ModelPara')
    init(){
      loadSearchColumns.call(this)
      loadColumns.call(this)
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
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd(1)}],
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.toAdd(3,false)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["copy",() => {this.toAdd(2)}],
        ["history",() => {this.toHistory(data.data)}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    //加载列表数据
    async load(params = this.searchParams,type='PARA_MANAGEMENT#selectWebApi',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res = await modelParaList(params,type)
      if(type === 'PARA_MANAGEMENT#selectVendorEqpModel'){
        return res
      }
      if(type === 'PARA_MANAGEMENT#copy'){
        return res
      }
      if(type !== 'PARA_MANAGEMENT#selectWebApi'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          this.toAdd(3,false,isUpdateSignalID) // isUpdateSignalID  用来记录单条数据的ID
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
      clearSort.call(this)
      resetData.call(this,['add','copy'])
    },
    //准备添加
    @addValidate()
    async toAdd(type,reloadSearchData,isUpdateSignalID) { //type 1 是新增  2 是复制 3是搜索
      type === 1 ? this.add() : (type === 2 ? this.copy() : this.searchSubmit(undefined,reloadSearchData,isUpdateSignalID))
    },
    // 添加
    @getHasPrivTip('C')
    async add(){
      addData.call(this,['add','save'])
    },
    //编辑
    @getHasPrivTip('U')
    @confirmTip('v_confirm_model_para_is_used','USER_STATE')
    async toEdit(rowIndex){
      comEdit.call(this,rowIndex,['edit'],['save'])
    },
    // 删除
    @getHasPrivTip('D')
    @deleteValidata()
    async toDel(data) {
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {[this.tableOptions.id]:v[this.tableOptions.id]}}) : {[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id]}
      this.load(delIds, 'PARA_MANAGEMENT#delete')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData,filterData[0].tableType === 'add' ? 'PARA_MANAGEMENT#saveWithPkSeq' : 'PARA_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    // 准备复制
    @getHasPrivTip('C')
    async copy(){
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'MODEL_PARA_POP_VENDOR_EQP_MODEL_LIST',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      this.rightBaseProps.columns = columns
      const tableTypeResult = getTableType(columns)
      const timeArr = tableTypeResult.timeArr
      const switchArr = tableTypeResult.switchArr
      const res = await this.load({...this.searchParams,VENDOR_EQP_MODEL_OLD:this.searchParams.VENDOR_EQP_MODEL},'PARA_MANAGEMENT#selectVendorEqpModel')
      this.$set(this.rightBaseProps,'data',formatParam((res.DATA || []),timeArr,switchArr))
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.transfer.clear()
      })
    },
    // 复制confirm
    async confirmCopy(){
      const params = this.selects.map(v=>{return {...this.searchParams,VENDOR_EQP_MODEL_OLD:this.searchParams.VENDOR_EQP_MODEL,VENDOR_EQP_MODEL_NEW:v.VENDOR_EQP_MODEL}})
      const res = await this.load(params,'PARA_MANAGEMENT#copy')
      if(res.RETURN.RETURN_MSG === "SUCCESS"){
        this.$show.execSuccess()
        this.dialogVisible = false
      }
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
<style lang="scss" scoped>
.el-menu{
  width: 318px;
}
.el-menu--collapse.el-menu{
  width: 0;
}
</style>
