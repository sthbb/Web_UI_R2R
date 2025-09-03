<template>
  <div class="priv-contain">
    <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('v_dialog_title_priv')}" @handleTableChange="handleTableChange" ref="tableRef"/>
  </div>
</template>

<script>
import BaseTable from "@/component/BaseTable"
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,toCheckbox,comEdit,toCancelEdit,saveSignlData,toResetTableStatus,addData,selectChange } from '@/commn/comTable'
import { getColMap,axiosParams,objValueIsNull,getFinallyData,searchFormSetting,resetParams } from '@/commn/commonFn'
export default {
  props:{
    height:{
      type:Number,
      default:0
    },
    searchForm:{
      type:Array,
      default:()=>{return []}
    },
    searchParams:{
      type:Object,
      default:()=>{return {}}
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
    BaseTable
  },
  data() {
    return {
      GRID_ID:"PRIV",
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'PRIV_ID',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[],
        maxHeight:this.height
      },
      actions:[],
      editData:[]
    }
  },
  methods: {
    async initSearchData(reloadSearchData,isUpdateSignalID){
      reloadSearchData && await loadColumns.call(this)
      this.load(undefined,undefined,isUpdateSignalID)
    },
    // table操作处理
    handleTableChange(result) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(result.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(result.data)}],
        ["save",() => {this.toSave(result.data)}],
        ["page",() => {this.$emit('initData',{reloadSearchData:false})}],
        ["jumpmenu",() => {this.toJumpMenu(result.data)}],
        ["jumpuser",() => {this.toJumpUser(result.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(result.type) && tableType.get(result.type)()
    },
    // 加载search列
    async loadSearchColumns(reserveData=false){
      const searchForm = await getColMap({
        FUNC_ID: this.FUNC_ID,
        GRID_ID:'PRIV',
        SEARCH_DISP_YN:'Y'
      }) || []
      const res =  await searchFormSetting(resetParams((searchForm || []),true),this.searchParams,reserveData) 
      this.$emit('toSearchForm',res)
    },
    // 初始化数据
    async initData(){
      await this.loadSearchColumns()
      await loadColumns.call(this)
    },
    //加载列表数据
    async load(params = this.searchParams,type='PRIV_MANAGEMENT#select',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'PRIV_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          isUpdateSignalID === undefined && this.loadSearchColumns(true)
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
      this.$emit('emitAdd','1')
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
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {[this.tableOptions.id]:v[this.tableOptions.id]}}) :  {[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id]}
      this.load(delIds, 'PRIV_MANAGEMENT#delete')
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? 'PRIV_MANAGEMENT#save' : 'PRIV_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    // 权限菜单
    toJumpMenu(data){
      this.$emit("toJump",{type:'2',data:{PRIV_ID:this.tableOptions.data[data].PRIV_ID}})
    },
    // 权限用户
    toJumpUser(data){
      this.$emit("toJump",{type:'3',data:{PRIV_ID:this.tableOptions.data[data].PRIV_ID}})
    }
  }
}
</script>

<style scoped lang="scss">
.priv-contain{
  width: 100%;
}
</style>