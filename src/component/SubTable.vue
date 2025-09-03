<template>
  <div>
    <BaseSearch :inline="true" :data="searchForm" :params="searchParams" @emitChild="searchFn" @submit="searchSubmit" ref="searchRef" :labelWidth="'100px'" :showReset="false"/>
    <BaseTable :tableOptions="{...tableOptions,exportTitle}" @handleTableChange="handleTableChange" ref="tableRef"/>
  </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTable from "@/component/BaseTable"
import { getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,comEdit,toCancelEdit,resetSubmit,saveSignlData,toResetTableStatus,addData,selectChange,searchFn } from '@/commn/comTable'
import {formatParam,axiosParams,objValueIsNull,searchRequireParams} from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
  },
  props:{
    FUNC_ID:{
      type:String,
      default:''
    },
    subParams:{
      type:Object,
      default:()=>{return {}}
    },
    GRID_ID:{
      type:String,
      default:''
    },
    ID:{
      type:String,
      default:''
    },
    api:{
      type:Object,
      default:()=>{return {}}
    },
    delParams:{
      type:Object,
      default:()=>{return {}}
    },
    isInitData:{
      type:Boolean,
      default:false
    },
    exportTitle:{
      type:String,
      default:''
    }
  },
  data() {
    return {
      searchParams:{},
      searchForm:[],
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:this.ID,
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{
        },
        actions:[],
        maxHeight:500
      },
      editData:[],
      actions:[],
      idsCombine:[]
    }
  },
  created(){
    this.init()
  },
  methods: {
    async init(){
      await loadSearchColumns.call(this)
      await loadColumns.call(this)
      this.isInitData && this.toAdd(false)
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
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.toAdd(false,false)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}],
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    //加载列表数据
    async load(params = this.searchParams,type=this.api.select,isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== this.api.select){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          isUpdateSignalID === undefined && loadSearchColumns.call(this,true)
          this.toAdd(false,false,isUpdateSignalID)
        }
        return
      }
      const result = formatParam((res.DATA||[]),this.timeArr,this.switchArr,this.numberArr).map((v,i)=>{
        const newItem = {...searchRequireParams(this.searchForm,this.searchParams),...v,ROW_NUM:i+1}
        if(this.idsCombine.length > 1){
          let ID = ''
          this.idsCombine.forEach(m=>{
            ID += v[m]
          })
          newItem.ID = ID
        }
        return {...newItem}
      })
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
      let delIds = []
      if(data === undefined){
        delIds = this.tableOptions.data.filter(v=>v.checked).map(m=>{
          let params = {}
          for(let key in this.delParams){
            params[key] = m[key]
          }
          return params
        })
      }else{
        let params = {}
        for(let key in this.delParams){
          params[key] = this.tableOptions.data[data][key]
        }
        delIds = params
      }
      this.load(delIds, this.api.delete)
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData, filterData[0].tableType === 'add' ? this.api.add : this.api.update,data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    }
  },
  watch:{
    subParams:{
      immediate:true,
      deep:true,
      handler(newParam){
        this.searchParams = {...this.searchParams,...newParam}
      }
    },
    ID:{
      immediate:true,
      deep:true,
      handler(newData){
        if(newData.split(",").length > 1){
          this.tableOptions.id = 'ID'
          this.idsCombine = newData.split(",")
        }else{
          this.tableOptions.id = newData
        }
      }
    }
  }
}
</script>
