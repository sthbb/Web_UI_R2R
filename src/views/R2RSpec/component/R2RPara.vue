<template>
    <div>
      <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('v_r2rspec_r2r_para')}" @handleTableChange="handleTableChange" ref="tableRef"/>
      <el-dialog
        :visible.sync="dialogVisible"
        :width="dialogType === 'addWeight' ? '50%' : '85%'"
        :append-to-body="true"
        :before-close="()=>{cancelConfirm()}"
        :close-on-click-modal = "false"
      >
        <span slot="title">
          <div class="diolag-box" :style="{background:$root.theme}">
            <div>{{getTitie}}</div>
          </div>
        </span>
        <ViewHistory v-if="dialogType === 'history'" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="R2RPARASPECHIST_MANAGEMENT#select" />
        <AddWeight :weight="weight" @finalyData="saveWeight" ref="addWeight" v-if="dialogType === 'addWeight'" :disabled="isSeeWeight" />
        <AddGroupFomula v-if="dialogType === 'formula'" :formulaGroup="formulaGroup" type="see" :ref="'formulaGroupRef'" :addTableData="addTableData" :operandData="operandData" :searchParams="searchParams"/>
        <span slot="footer">
          <template v-if="dialogType ===  'addWeight'">
            <el-button @click="cancelConfirm()" :type="isSeeWeight ? 'primary' : 'default'">{{ isSeeWeight ? $t('btn_close') : $t('btn_cancel')}}</el-button>
            <el-button @click="$refs.addWeight && $refs.addWeight.copy()" :disabled="!isCanCopy" v-if="!isSeeWeight">{{$t('btn_copy_all')}}</el-button>
            <el-button @click="$refs.addWeight && $refs.addWeight.empty()" v-if="!isSeeWeight">{{$t('btn_reset_all')}}</el-button>
            <el-button @click="$refs.addWeight && $refs.addWeight.resetDefalut()" v-if="!isSeeWeight">{{$t('btn_reset_default')}}</el-button>
            <el-button type="primary" :disabled="!isShowConfirm" @click="$refs.addWeight && $refs.addWeight.save()" v-if="!isSeeWeight">{{$t('btn_confirm')}}</el-button>
          </template>
          <el-button type="primary" @click="cancelConfirm()" v-else>{{$t('btn_close')}}</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import AddWeight from './AddWeight'
import ViewHistory from './ViewHistory'
import AddGroupFomula from '../../Formula/component/AddGroupFomula'
import { confirmTip,getHasPrivTip,saveValidate,deleteValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,toCheckbox,comEdit,toCancelEdit,saveSignlData,toResetTableStatus,selectChange,filterAll } from '@/commn/comTable'
import { axiosParams,getFinallyData,objValueIsNull,formatParam,searchRequireParams,importFilterFiled  } from '@/commn/commonFn'
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
    AddWeight,
    ViewHistory,
    AddGroupFomula
  },
  data() {
    return {
      GRID_ID:'R2R_PARA_SPEC',
      specialkeyArr:[], //编辑时候 特殊参数
      timeArr:[],//时间格式
      switchArr:[],//switch集合
      numberArr:[],//number类型集合
      tableOptions: {//table 参数配置
        id: "R2R_PARA_SPEC_KEY",
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[]
        },
        actions:[]
      },
      editData:[],//编辑取消参数对比用的
      weight:{//权重对象
        index:'',
        data:[]
      },
      dialogVisible:false,
      isShowConfirm:false,//权重是否正确
      isCanCopy:false,//是否可以copy
      dialogType:'history',
      addTableData:[],
      formulaGroup:{},
      operandData:[],
      actions:[],
      formulaList:[]
    }
  },
  async created() {},
  computed: {
    getTitie(){
      const titleArr = new Map([
        ['history',this.$t('v_dialog_title_view_history')],
        ['addWeight',(this.isSeeWeight ? this.$t('v_dialog_title_view_weight') : (this.isEditWeight ? this.$t('v_dialog_title_edit_weight') : this.$t('v_dialog_title_add_weight')))],
        ['formula',this.$t('v_dialog_title_view_formula_group')]
      ])
      return titleArr.get(this.dialogType)
    },
    isSeeWeight(){
      return this.tableOptions.data.length > 0 && this.weight.index !== '' && !this.tableOptions.data[this.weight.index].tableType
    },
    isEditWeight(){
      return this.tableOptions.data.length > 0 && this.weight.index !== '' && this.tableOptions.data[this.weight.index].REF_WEIGHT
    }
  },
  methods: {
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data,[])}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.$emit('initData',{reloadSearchData:false})}],
        ["cell",() => {this.toCell(data.data)}],
        ["history",() => {this.toHistory(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this,[])}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 获取数据
    async initData(reloadSearchData,isUpdateSignalID){
      reloadSearchData && await loadColumns.call(this)
      this.load(undefined,undefined,isUpdateSignalID)
    },
    //加载列表数据
    async load(params = this.searchParams,type='R2RPARASPEC_MANAGEMENT#selectWebApi',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      const typeArr = new Map([
        ['FORMULAMAP_MANAGEMENT#selectByGrp',()=>{//已导入的算法列表
          this.addTableData = formatParam(res.DATA||[])
          this.tableOptions.expandData = this.addTableData.map((v,i)=>{return {...v,ROW_NUM:i+1}})
        }],
        ['FORMULAGRP_MANAGEMENT#select',()=>{//算法列表
          this.formulaList = formatParam((res.DATA || []))
        }], 
        ['R2RPARASPEC_MANAGEMENT#updateWeights',()=>{//weight 全部复制
          return res
        }], 
        ['R2RPARASPEC_MANAGEMENT#selectWebApi',async()=>{
          const result = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
          this.editData = result.map(v=>Object.assign({},v))
          if(isUpdateSignalID !== undefined){ // 保存单条数据并更新成最新数据
            saveSignlData.call(this,isUpdateSignalID,result)
            return 
          }
          this.tableOptions.data = result
          this.initUnimport()
          resetData.call(this,[])
        }]
      ])
      if( typeArr.get(type)){
        typeArr.get(type)()
        return
      }
      if(res.RETURN.RETURN_MSG === "SUCCESS"){//新增 编辑 删除
        this.$show.execSuccess()
        /**
         * isUpdateSignalID 为false 时候是 weight 一键复制 功能  只需要调用一键复制接口
         * isUpdateSignalID 是实际意义上的id时候  是单条保存功能
         */
        isUpdateSignalID !== false && this.$emit('initData',{reloadSearchData:false,isUpdateSignalID})
      }
    },
    //未导入的模板
    async initUnimport(){
      const { modelParaList } = this.$api.parameter
      let res = await modelParaList({...this.searchParams},'R2RPARASPEC_MANAGEMENT#selectPara')
      res = formatParam(res.DATA,this.timeArr,this.switchArr,this.numberArr)
      if(res.length > 0){
        filterAll.call(this,[],['save','cancel'],true,false,true)
        let DISP_SEQ = this.tableOptions.data.length
        res.forEach((element,i) => {
          importFilterFiled.forEach(m=>{
            element[m] = null
          })
          this.tableOptions.data.unshift({...searchRequireParams(this.searchForm,this.searchParams),...element,tableType:'add',checked:true,disabled:true,EQP_ID:this.searchParams.EQP_ID,DISP_SEQ:DISP_SEQ+i+1,ROW_NUM:DISP_SEQ+i+1,R2R_MODEL_NAME:this.searchParams.R2R_MODEL_NAME})
        })
      }
      clearSort.call(this)
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this,[])
    },
    // 取消模态框操作
    cancelConfirm(){
      this.dialogVisible = false
      this.dialogType=''
      this.operandData = []
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
      this.load(delIds, 'R2RPARASPEC_MANAGEMENT#delete')
    },
    // 保存
    @getHasPrivTip('C','hasModel')
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? 'R2RPARASPEC_MANAGEMENT#saveWebApi' : 'R2RPARASPEC_MANAGEMENT#updateWebApi',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    //单元格点击
    toCell(data){
      const cellArr = new Map([
        ['REF_WEIGHT',()=>{this.toWeight(data.rowIndex,'REF_WEIGHT')}],
        ['FORMULA_GRP_DEFAULT',()=>{this.toFormulaGroup(data.rowIndex,data.name)}],
        ['FORMULA_GRP_SUB_FORMULA',()=>{this.toFormulaGroup(data.rowIndex,data.name)}],
        ['FORMULA_GRP_REWORK',()=>{this.toFormulaGroup(data.rowIndex,data.name)}],
        ['FORMULA_GRP_SAMPLE',()=>{this.toFormulaGroup(data.rowIndex,data.name)}],
      ])
      cellArr.get(data.name) && cellArr.get(data.name)()
    },
    // 查看算法
    async toFormulaGroup(index,name){
      const isOperate = this.tableOptions.data.length !== this.editData.length 
      let isOld = false
      // 判断值有没有改变
      if(isOperate){// 数据中有新增的
        const editDataIndex = this.tableOptions.data.filter(v=>v.tableType).length
        this.tableOptions.data[index].tableType ? isOld = false : isOld = this.tableOptions.data[index][name] === this.editData[index-editDataIndex][name]
      }else{
        isOld = this.tableOptions.data[index][name] === this.editData[index][name]
      }
      const findItem = this.specialkeyArr.find(v=>v.COL_NAME === name)?.BIND_DISP_COLS
      const keys = findItem && findItem.split(",").length > 2 ? findItem.split(",")[2] : findItem.split(",")[0]
      const key = isOld ? this.tableOptions.data[index][keys] : this.tableOptions.data[index][name] 
      if(!key){
        this.$show.openWarning(this.$t('v_notice_select_formula_group'))
        return false
      }
      await this.load({FORMULA_GRP_KEY:key},'FORMULAGRP_MANAGEMENT#select')
      this.formulaGroup = {...searchRequireParams(this.searchForm,this.searchParams),...this.formulaList[0]}
      await this.load({FORMULA_GRP_KEY:key} ,'FORMULAMAP_MANAGEMENT#selectByGrp')
      this.dialogType = 'formula'
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.addTableData.length > 0 && this.$refs.formulaGroupRef.toExpendOperand(0)
      })
    },
    // 权重
    toWeight(data,name){
      this.dialogType = 'addWeight'
      const defaultValue = "|;|;;|;;;|;;;;"
      this.dialogVisible = true
      this.weight.index = data;
      this.weight.data = []
      const weight = this.tableOptions.data[data].REF_WEIGHT || defaultValue
      weight.split("|").forEach(v=>{
        const obj = {}
        v.split(";").forEach((m,i)=>{
          obj[`LOT${i+1}`] = m ? m*100 : null
        })
        this.weight.data.push(obj)
      })
    },
    // 保存weight
    saveWeight(data){ //type 0 是否展示确定按钮  1 复制  2 确定 3 一键清空
    if(data.type === 1){
      this.toCopy(data)
      return
    }
    if(data.type === 0 || data.type === 3){
      this.isCanCopy = data.result && data.result.every(v=>v.TOT === 100)
      this.isShowConfirm = data.type === 3 || (data.result && (data.result.every(v=>v.TOT === 100) || data.result.every(v=>v.TOT === '')))
      return
    }
    this.tableOptions.data[this.weight.index].REF_WEIGHT = data.result
    this.dialogVisible = !(!!data.type)
    },
    // 复制
    @confirmTip('v_confirm_copy_confirm')
    async toCopy(data){
      this.tableOptions.data = this.tableOptions.data.map(v=>{return {...v,REF_WEIGHT:data.result}})
      await this.load({REF_WEIGHT:data.result,...this.searchParams},"R2RPARASPEC_MANAGEMENT#updateWeights",false)
      this.dialogVisible = false
    },
    // 历史
    async toHistory(index){
      this.dialogType = 'history'
      const key = this.tableOptions.id
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.viewHistory.initData({[key]:this.tableOptions.data[index][key]})
      })
    }
  }
}
</script>
