<template>
    <div>
      <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('v_r2rspec_ref_spec')}" @handleTableChange="handleTableChange" ref="tableRef"/>
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
        <ViewHistory v-if="showHistory" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="REFSPECHIST_MANAGEMENT#select" />
        <AddPara v-else :searchParams="searchParams" ref="addPara" :tableData="tableData"/>
        <span slot="footer">
          <el-button v-if="!showHistory" @click="cancelConfirm">{{$t('btn_cancel')}}</el-button>
          <el-button v-if="!showHistory" type="primary" @click="()=>{comAddPara.call(this)}">{{$t('btn_confirm')}}</el-button>
          <el-button v-if="showHistory" type="primary" @click="cancelConfirm">{{$t('btn_close')}}</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import ViewHistory from './ViewHistory'
import AddPara from './AddPara'
import { getHasPrivTip,saveValidate,deleteValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,toCheckbox,comEdit,toCancelEdit,saveSignlData,toResetTableStatus,selectChange,comInitUnimport,comAddPara } from '@/commn/comTable'
import { axiosParams,getFinallyData,objValueIsNull } from '@/commn/commonFn'
export default {
  props:{
    searchParams:{
      type:Object,
      default:()=>{return {}}
    },
    searchForm:{
      type:Array,
      default:()=>{return []}
    },
    height:{
      type:Number,
      default:0
    },
    FUNC_ID:{
      type:Number|String,
      default:0
    },
    title:{
      type:String,
      default:''
    }
  },
  components: {
    BaseTable,
    ViewHistory,
    AddPara
  },
  data() {
    return {
      comAddPara,
      GRID_ID:'REF_SPEC',
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id: "REF_SPEC_KEY",
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
      actions:[],
      cascaders:['REF_MODE','MEAS_OPER_ID']
    }
  },
  methods: {
    // 获取数据
    async initData(reloadSearchData,isUpdateSignalID){
      reloadSearchData && await loadColumns.call(this)
      this.load(undefined,undefined,isUpdateSignalID)
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
        ["page",() => {this.$emit('initData',{reloadSearchData:false})}],
        ["history",() => {this.toHistory(data.data)}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    //加载列表数据
    async load(params = this.searchParams,type='REFSPEC_MANAGEMENT#selectWebApi',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'REFSPEC_MANAGEMENT#selectWebApi'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          this.$emit('initData',{reloadSearchData:false,isUpdateSignalID})
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
      clearSort.call(this)
      resetData.call(this)
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this)
    },
    //准备新增
    toAdd(){
      this.$emit('emitAdd','5')
    },
    // 新增
    @getHasPrivTip('C')
    async add(){
      await comInitUnimport.call(this,'REF_SPEC_POP_ADD_PARA')
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
      this.load(delIds, 'REFSPEC_MANAGEMENT#deleteWebApi')
    },
    // 保存
    @saveValidate(3)
    async toSave(data){
      let filterData = data === undefined  ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData,  filterData[0].tableType === 'add' ? 'REFSPEC_MANAGEMENT#saveWebApi' : 'REFSPEC_MANAGEMENT#updateWebApi', data !== undefined  ? this.tableOptions.data[data][this.tableOptions.id] : data)
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
