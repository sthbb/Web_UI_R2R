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
            <div>{{$t('v_dialog_title_view_id_rule_item')}}</div>
          </div>
        </span>
        <SubTable :FUNC_ID="FUNC_ID" :exportTitle="$t('v_dialog_title_view_id_rule_item')" :subParams="subParams" GRID_ID="ID_RULE_POP" ID="RULE_ID" :api="subApi" :delParams="{RULE_ID:'',ITEM:'',FAC_ID:''}" :key="key" :isInitData="true"/>
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
import SubTable from '@/component/SubTable'
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,addData,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
import { axiosParams,objValueIsNull,getFinallyData,searchRequireParams} from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    SubTable,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID :"ID_RULE",
      isCollapse: false,
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'RULE_ID',
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
      subApi:{
        select:'IDRULEITEM_MANAGEMENT#select',
        add:'IDRULEITEM_MANAGEMENT#save',
        update:'IDRULEITEM_MANAGEMENT#update',
        delete:'IDRULEITEM_MANAGEMENT#delete'
      },
      subParams:{},
      key:0,
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
    @getFuncID('System/IDRule')
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
        ["detail",() => {this.toDetail(data.data)}],
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
    //加载列表数据
    async load(params = this.searchParams,type='IDRULE_MANAGEMENT#select',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'IDRULE_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          isUpdateSignalID === undefined && loadSearchColumns.call(this,true)
          this.toAdd(false,false,isUpdateSignalID)
        }
        return
      }
      const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams).map(v=>{return {...v,ID:this.searchParams.FAC_ID+v.CODE_GRP_ID+v.CODE_TYPE}})
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
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {[this.tableOptions.id]:v[this.tableOptions.id],FAC_ID:this.searchParams.FAC_ID}}) :  {[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id],FAC_ID:this.searchParams.FAC_ID}
      this.load(delIds, 'IDRULE_MANAGEMENT#delete')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? 'IDRULE_MANAGEMENT#save' : 'IDRULE_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    //查看详情
    toDetail(data){
      this.subParams = {...searchRequireParams(this.searchForm,this.searchParams),RULE_ID:this.tableOptions.data[data.rowIndex].RULE_ID || null}
      this.key++
      this.dialogVisible = true
    }
  }
}
</script>
