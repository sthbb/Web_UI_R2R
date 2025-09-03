<template>
    <div>
      <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('v_r2rspec_current_para')}" @handleTableChange="handleTableChange" ref="tableRef"/>
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
        <ViewHistory v-if="showHistory" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="CURRR2RPARAHIST_MANAGEMENT#select" showSearch showPage/>
        <AddPara v-else :searchParams="searchParams" ref="addPara" :tableData="tableData" :title="'currentPara'" />
        <span slot="footer">
          <el-button v-if="!showHistory" @click="cancelConfirm">{{$t('btn_cancel')}}</el-button>
          <el-button v-if="!showHistory" type="primary" @click="addConfirm">{{$t('btn_confirm')}}</el-button>
          <el-button v-if="showHistory" type="primary" @click="cancelConfirm">{{$t('btn_close')}}</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import AddPara from "./AddPara"
import ViewHistory from './ViewHistory'
import { getHasPrivTip,saveValidate,deleteValidata } from '@/commn/decoratorFn'
import { loadColumns,keepSort,clearSort,resetData,toCheckbox,comEdit,toCancelEdit,saveSignlData,toResetTableStatus,selectChange,filterAll } from '@/commn/comTable'
import { getColMap,resetParams,formatParam,axiosParams,getTableType,searchRequireParams,colCascaderData,getFinallyData,objValueIsNull } from '@/commn/commonFn'
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
    AddPara,
    ViewHistory
  },
  data() {
    return {
      GRID_ID:'CURR_R2R_PARA',
      specialkeyArr:[],
      timeArr:[],//日期
      switchArr:[], //switch
      numberArr:[],//number类型集合
      tableOptions: {
        id: "CURR_R2R_PARA_KEY",
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
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
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    //加载列表数据
    async load(params = this.searchParams,type='CURRR2RPARA_MANAGEMENT#selectWebApi',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'CURRR2RPARA_MANAGEMENT#selectWebApi'){
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
    // 未导入的模板
    async initUnimport(){
      const { modelParaList } = this.$api.parameter
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'CURR_R2R_PARA_POP_ADD_PARA',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      const tableTypeResult = getTableType(columns)
      const timeArr = tableTypeResult.timeArr
      const switchArr = tableTypeResult.switchArr
      const res = await modelParaList({...this.searchParams},'CURRR2RPARA_MANAGEMENT#selectPara')
      this.tableData.columns = columns
      const newData = formatParam((res.DATA||[]),timeArr,switchArr).map(v=>{return{...v,ID:v.RECIPE_PARA,checked:this.selectData.findIndex(m=>m.ID === v.RECIPE_PARA) > -1,disabled:this.selectData.findIndex(m=>m.ID === v.RECIPE_PARA) > -1}})
      this.$set(this.tableData,'data',newData)
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this)
    },
    //准备新增
    toAdd(){
      this.$emit('emitAdd','1')
    },
    //新增
    @getHasPrivTip('C')
    async add(){
      await this.initUnimport()
      this.dialogVisible = true
    },
    // 新增确认
    async addConfirm(){
      this.selectData = this.$refs.addPara.tableOptions.data.filter(v=>v.checked)
      if(this.selectData.length === 0){
        this.$show.openWarning(this.$t('v_notice_select_add_para'))
        return
      }
      filterAll.call(this,[],['add','save'],true,false,true)
      const addParams = {...searchRequireParams(this.searchForm,this.searchParams),
        R2R_MODEL_NAME:this.searchParams.R2R_MODEL_NAME,
        PARA_USE_YN:true
      }
      let DISP_SEQ = this.tableOptions.data.length
      this.selectData.forEach(async (v,i)=>{
        if( this.tableOptions.data.findIndex(m=>m.ID=== v.ID) === -1){
          const newData = await colCascaderData([...this.tableOptions.columns],{...addParams,...v,R2R_PARA:v.RECIPE_PARA,DISP_SEQ:DISP_SEQ+i+1,ROW_NUM:DISP_SEQ+i+1, tableType:'add',checked:true,disabled:true})
          this.tableOptions.data.unshift(newData)
        }
      })
      keepSort.call(this)
      this.dialogVisible = false
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
      this.load(delIds, 'CURRR2RPARA_MANAGEMENT#deleteWebApi')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      // current para 参数关闭时候  如果在R2R PARA中需要风险提示
      const tips = filterData.filter(v=>{
        const findOld = this.editData.find(m=>m[this.tableOptions.id] === v[this.tableOptions.id])
        return v.PARA_USE_YN === 'N' && findOld && findOld.PARA_USE_YN && v.REAL_PARA_USE_YN === 'Y'
      })
      tips.length > 0 && await this.$confirm(this.$t('v_confirm_current_para_is_used'), this.$t('v_confirm_tip'), {
        confirmButtonText: this.$t('btn_confirm'),
        cancelButtonText: this.$t('btn_cancel'),
        type: 'warning'
      })
      this.load(filterData, filterData[0].tableType === 'add' ? 'CURRR2RPARA_MANAGEMENT#saveWebApi' : 'CURRR2RPARA_MANAGEMENT#updateWebApi',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    // 历史
    async toHistory(index){
      this.showHistory = true
      const key = this.tableOptions.id
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.viewHistory.initData({[key]:this.tableOptions.data[index][key]})
      })
    }
  }
}
</script>
