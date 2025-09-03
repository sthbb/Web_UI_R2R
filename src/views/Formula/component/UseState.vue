<template>
  <div>
    <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)}"  @handleTableChange="handleTableChange" ref="tableRef"/>
    <el-dialog :visible.sync="addFomulaGroupVisible" width="80%" :append-to-body="true" :before-close="()=>{resetGroupData()}">
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{$t('v_dialog_title_view_formula_group')}}</div>
        </div>
      </span>
      <AddGroupFomula :formulaGroup="formulaGroup" type="see" ref="formulaGroupRef" :addTableData="addTableData" :operandData="operandData" :searchParams="searchParams"/>
      <span slot="footer">
        <el-button @click="resetGroupData" type="primary">{{$t('btn_close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import AddGroupFomula from './AddGroupFomula'
import BaseTable from "@/component/BaseTable"
import { loadColumns,clearSort,resetData } from '@/commn/comTable'
import { getColMap,resetParams,formulaVariate,formatParam,columnsCellShow,addSelectOptions,objValueIsNull,getTableType,searchRequireParams,getFinallyData} from '@/commn/commonFn'
export default {
  props:{
    searchForm:{
      type:Array,
      default:()=>{return []}
    },
    searchParams:{
      type:Object,
      default:()=>{return {}}
    },
    height:{
      type:Number,
      default:0
    },
    FUNC_ID:{
      type:String,
      default:''
    },
    title:{
      type:String,
      default:''
    }
  },
  components: {
    BaseTable,
    AddGroupFomula
  },
  data() {
    return {
       GRID_ID:'USE_STATE',
      specialkeyArr:[], //编辑时候 特殊参数
      timeArr:[],//时间格式
      switchArr:[],//switch集合
      numberArr:[],//number类型集合
      tableOptions: {
        id: "FORMULA_GRP_KEY",
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[]
        },
        actions:[],
        isExpand:true,
        expandColumn:[],
        expandData:[],
        maxHeight:0,
      },
      addFomulaGroupVisible:false,
      formulaGroup:{},
      addTableData:[],
      operandData:[],
      formulaList:[]
    }
  },
  async created() {
    loadColumns.call(this)
    this.loadExpendColumns()
  },
  computed: {},
  methods: {
    // 获取数据
    async initData(reloadSearchData){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["page",() => {this.$emit('initData',false)}],
        ["expand",() => {this.toExpand(data.data)}],
        ["detail",() => {this.toDetail(data.data.rowIndex)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["cell",() => {this.toCell(data.data)}],
        ["jumpmodelspec",() => {this.toModelSpec(data.data)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载table expend 列
    async loadExpendColumns(){
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'USE_STATE_EXPAND',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      const tableTypeResult = getTableType(columns)
      this.expendTimeArr = tableTypeResult.timeArr
      this.expendSwitchArr = tableTypeResult.switchArr
      this.tableOptions.expandColumn = columns
    },
    // 加载列表
    async load(params = this.searchParams,type= 'PARAFORMULAMAP_MANAGEMENT#selectUseState'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type === 'FORMULAGRP_MANAGEMENT#select'){
        this.formulaList = formatParam((res.DATA || []))
        return
      }
      if(type === 'FORMULAMAP_MANAGEMENT#selectByGrp'){//已导入的算法列表
        this.addTableData = formatParam((res.DATA || []),this.expendTimeArr,this.expendSwitchArr)
        this.tableOptions.expandData = this.addTableData.map((v,i)=>{return {...v,ROW_NUM:i+1}})
        return
      }
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      clearSort.call(this)
    },
    //单元格点击
    toCell(data){
      const cellArr = new Map([
        ['FORMULA_GRP_NAME',()=>{this.toDetail(data.rowIndex)}],
      ])
      cellArr.get(data.name) && cellArr.get(data.name)()
    },
    //查看算法组
    async toDetail(index){
      await this.load({...this.searchParams,FORMULA_GRP_KEY:this.tableOptions.data[index].FORMULA_GRP_KEY},'FORMULAGRP_MANAGEMENT#select')
      this.formulaGroup = {...this.searchParams,...this.formulaList[0]}
      await this.load({FORMULA_GRP_KEY:this.formulaGroup[this.tableOptions.id]} ,'FORMULAMAP_MANAGEMENT#selectByGrp')
      this.addFomulaGroupVisible = true
      this.$nextTick(()=>{
        this.addTableData.length > 0 && this.$refs.formulaGroupRef.toExpendOperand(0)
      })
    },
    //展开
    toExpand(index){
      this.load({FORMULA_GRP_KEY:this.tableOptions.data[index].FORMULA_GRP_KEY} ,'FORMULAMAP_MANAGEMENT#selectByGrp')
    },
    // to model Spec
    toModelSpec(index){
      const data = this.tableOptions.data[index]
      sessionStorage.setItem("jumpParams",JSON.stringify({FAC_ID:data.FAC_ID,AREA_ID:data.AREA_ID,EQP_ID:data.EQP_ID,RECIPE_ID:data.RECIPE_ID}))
      this.$router.push({path:'/R2RSpec'})
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this)
    },
    //添加算法数据重置
    resetGroupData(){
      this.addTableData = []
      this.tableData = []
      this.operandData = []
      this.addFomulaGroupVisible = false
      for(let key in this.formulaGroup){
        this.formulaGroup[key] = ''
      }
    }
  }
}
</script>
