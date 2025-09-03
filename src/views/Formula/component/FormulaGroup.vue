<template>
  <div>
    <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('c_formula_group')}"  @handleTableChange="handleTableChange" ref="tableRef"/>
    <el-dialog :visible.sync="addFomulaGroupVisible" width="85%" :append-to-body="true"  :before-close="()=>{resetGroupData()}" :class="$root.theme">
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{showHistory ? $t('v_dialog_title_view_history') : (formulaGroup[this.tableOptions.id] ? $t('v_dialog_title_edit_formula_group') : $t('v_dialog_title_add_formula_group'))}}</div>
        </div>
      </span>
      <AddGroupFomula v-if="!showHistory" :formulaGroup="formulaGroup" ref="formulaGroupRef" :formulaGroupType="formulaGroupType" :addTableData="addTableData" :tableData="tableData" @addFormula="addFormula" @delFormula="delFormula" @dragEnd="dragEnd" :searchParams="searchParams" :firstAddData="firstAddData"/>
      <FormulaHistory v-else :historyColumns="historyColumns" :historyList="historyList" ref="formulaHistoryRef" :historyData="formulaGroup" :formulaGroupType="formulaGroupType" @expandFormula="expandFormula" :formulaDetail="formulaDetail"/>
      <span slot="footer">
        <el-button @click="resetGroupData" :type="showHistory || !showConfirm ?'primary' : 'default'">{{showHistory || !showConfirm? $t('btn_close') : $t('btn_cancel')}}</el-button>
        <el-button type="primary" @click="formulaSubmit" v-if="showConfirm">{{$t('btn_confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import AddGroupFomula from './AddGroupFomula'
import FormulaHistory from './FormulaHistory'
import BaseTable from "@/component/BaseTable"
import { getHasPrivTip } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,toCheckbox } from '@/commn/comTable'
import { getColMap,resetParams,delParams,formulaVariate,formatParam,axiosParams,commonDel,objValueIsNull,getTableType,timeFormat,searchRequireParams,getFinallyData } from '@/commn/commonFn'
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
    AddGroupFomula,
    FormulaHistory
  },
  data() {
    return {
      specialkeyArr:[], //编辑时候 特殊参数
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      GRID_ID:"FORMULA_GRP",
      tableOptions: {
        id: "FORMULA_GRP_KEY",
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        isExpand:true,
        expandColumn:[],
        expandData:[],
        actions:[]
      },
      addFomulaGroupVisible:false,
      formulaGroup:{},
      formulaGroupType:[],
      addTableData:[],
      tableData:[],
      delFormulaList:[],//删除的算法,
      sortFormulaList:[],//排序的算法
      firstAddData:[],//首次获取的已导入的算法,编辑的时候 和原数据进行对比用的
      showHistory:false,
      historyList:[],
      historyColumns:{
        columns:[],
        formulaColumns:[],
        oprdColumns:[]
      },
      hisTimeArr:[],
      hisSwithArr:[],
      actions:[],
      expendTimeArr:[],
      expendSwitchArr:[],
      formulaDetail:[]
    }
  },
  async created() {
    loadColumns.call(this)
    this.loadExpendColumns()
  },
  computed: {
    showConfirm(){
      const isHistory = this.showHistory
      const operendIsEdit = this.addTableData.filter(v=>v.opeType === 'edit').length > 0
      const isAdd = this.addTableData.filter(v=>v.opeType === 'add').length > 0
      const isDel = this.delFormulaList.length > 0
      // const isSort = this.sortFormulaList.filter(v=>{
      //   const find = this.firstAddData.find(m=>m.FORMULA_KEY === v.FORMULA_KEY)
      //   return find && v.FORMULA_SEQ !== find.FORMULA_SEQ
      // }).length > 0
      const isSort = this.addTableData.filter(v=>{
        const findItem = this.firstAddData.find(m=>m.FORMULA_KEY === v.FORMULA_KEY)
        const isChange = findItem && v.FORMULA_SEQ !== findItem.FORMULA_SEQ
        return !v.opeType && isChange
      }).length > 0 
      return !isHistory && (!this.formulaGroup.FORMULA_GRP_KEY  || this.formulaGroup.FORMULA_GRP_KEY && (isAdd || operendIsEdit || isDel || isSort))
    }
  },
  methods: {
    // 获取数据
    async initData(reloadSearchData){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["page",() => {this.$emit('initData',{reloadSearchData:false})}],
        ["expand",() => {this.toExpand(data.data)}],
        ["history",() => {this.toHistory(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载table expend 列
    async loadExpendColumns(){
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'FORMULA_GROUP_EXPAND',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      const tableTypeResult = getTableType(columns)
      this.expendTimeArr = tableTypeResult.timeArr
      this.expendSwitchArr = tableTypeResult.switchArr
      this.tableOptions.expandColumn = columns
    },
    // 加载列表
    async load(params = this.searchParams,type='FORMULAGRP_MANAGEMENT#select'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type === 'ENUMVAL_MANAGEMENT#select'){//算法组类型
        this.formulaGroupType = formatParam((res.DATA || [])).map(v=>{return {...v,label:v.ENUM_VAL,value:v.ENUM_VAL}})
        return
      }
      if(type === 'FORMULAGRPVER_MANAGEMENT#selectEditTime'){//算法历史记录
        const result = (res.DATA || []).map(v=>{
          for(let key in v){
            this.hisTimeArr.forEach(m=>{
              if(m.time === key){
                v[key+'_orignal'] = v[key]
              }
            })
          }
          return v
        })
        this.historyList = formatParam(result,this.hisTimeArr,this.hisSwithArr).map(v=>{return {...v,ID:Math.random()}})
        return
      }
      if(type === 'FORMULAGRPVER_MANAGEMENT#selectWebApi'){//算法历史详情
        this.formulaDetail = formatParam((res.DATA || []),this.hisTimeArr,this.hisSwithArr).map(v=>{return {...v,ID:Math.random()}})
        return
      }
      if(type === 'FORMULAMAP_MANAGEMENT#selectByGrp'){//已导入的算法列表
        this.addTableData = formatParam(res.DATA || [],this.expendTimeArr,this.expendSwitchArr).map(v=>{
          const OPERAND = v.OPERAND ? resetParams(v.OPERAND).map(v=>{return {...v,ID:Math.random()}}) : []
          return {...v,OPERAND}
        })
        this.firstAddData = this.addTableData.map(v=>{return {...v,OPERAND:(v.OPERAND.map(m=>{return {...m}}))}})
        this.tableOptions.expandData = this.addTableData.map((v,i)=>{return {...v,ROW_NUM:i+1}})
        return
      }
      if(type === 'FORMULAMAP_MANAGEMENT#getNotImpFormula'){//未导入的算法列表
        this.tableData = formatParam(res.DATA || [])
        return
      }
      if(type === 'FORMULAGRP_MANAGEMENT#save'){//新增算法名
        return res
      }
      
      if(type === 'FORMULAMAP_MANAGEMENT#update' || type === 'FORMULAGRP_MANAGEMENT#updateWebApi'){
        return res.RETURN.RETURN_MSG === "SUCCESS" ? Promise.resolve('SUCCESS') : Promise.reject('FAIL')
      }
      if(type !== 'FORMULAGRP_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          this.$emit('initData',{reloadSearchData:false,reladFormula:true})
        }
        return
      } 
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      clearSort.call(this)
      resetData.call(this)
      this.resetGroupData()
    },
    //准备新增
    toAdd(){
      this.$emit('emitAdd',0)
    },
    //visible展示与隐藏
    addFomulaIsVisible(bool){
      this.addFomulaGroupVisible = bool
    },
    //算法组类型
    async getformulaGroupType(){
      await this.load({...this.searchParams,ENUM_ID:'FML_GRP_TYPE_'+this.searchParams.AREA_ID},'ENUMVAL_MANAGEMENT#select')
    },
    // 新增 编辑算法组
    @getHasPrivTip('C','formula')
    async toEdit(index){
      const editData = index === undefined ? {} : {...this.tableOptions.data[index]}
      await this.getformulaGroupType()
      this.formulaGroup = {...this.formulaGroup,...searchRequireParams(this.searchForm,this.searchParams),...editData}
      await this.load(index === undefined ? {} : {FORMULA_GRP_KEY:this.formulaGroup[this.tableOptions.id]} ,'FORMULAMAP_MANAGEMENT#selectByGrp')
      await this.load(index === undefined ? {...this.searchParams,FORMULA_GRP_NAME:null} : {...this.searchParams,FORMULA_GRP_NAME:null,FORMULA_GRP_KEY:this.formulaGroup[this.tableOptions.id]},'FORMULAMAP_MANAGEMENT#getNotImpFormula')
      this.addFomulaIsVisible(true)
      this.$nextTick(()=>{
        this.addTableData.length > 0 && this.$refs.formulaGroupRef.toExpendOperand(0)
      })
    },
    //新增编辑算法组保存
    async formulaSubmit(){
      if(!this.formulaGroup.FORMULA_GRP_NAME){
        this.$show.openWarning(this.$t('v_notice_input_formula_group_name'))
        return
      }
      if(!this.formulaGroup.FORMULA_GRP_TYPE){
        this.$show.openWarning(this.$t('v_notice_select_formula_group_type'))
        return
      }
      if(this.addTableData.length === 0 ){
        this.$show.openWarning(this.$t('v_notice_setting_formula'))
        return
      }
      let isEmpty = false
      let index = 0
      let key = ''
      // 数值为空验证
      for(let i=0;i<this.addTableData.length;i++){
        const item = this.addTableData[i]
        index = i
        if(!item.OPERAND || item.OPERAND.length === 0){
          isEmpty = true
          break
        }
        const required = this.$refs.formulaGroupRef.operandColumn.map(v=>v.COL_NAME)
        for(let j=0;j<item.OPERAND.length;j++){
          const operandItem = item.OPERAND[j]
          for(let k=0;k<required.length;k++){
            if(!operandItem[required[k]]){
              isEmpty = true
              key = required[k]
              break
            }
          }
          if(isEmpty){
            break
          }
        }
        if(isEmpty){
          break
        }
      }
      if(isEmpty){
        key === '' ? this.$show.openWarning(this.$t('v_notice_please_setting_operand')) : this.$show.openWarning(`${this.$t('v_notice_formula')}${index+1} : ${key}${this.$t('v_notice_cannot_be_empty')}`)
        return
      }
      const param = delParams([{...this.formulaGroup,DEFAULT_YN:'Y'}])[0]
      if(this.formulaGroup.FORMULA_GRP_KEY && this.formulaGroup.USE_STATE > 0){//算法已使用  需要二次提示
        await this.$confirm(this.$t('v_confirm_formula_is_used'), this.$t('v_confirm_tip'), {
          confirmButtonText: this.$t('btn_confirm'),
          cancelButtonText: this.$t('btn_cancel'),
          type: 'warning'
        })
      }
      let filteraddData = axiosParams(this.addTableData.filter(v=>v.opeType === 'add')).map(v=>{return{...v,EVENT:'save'}}) //添加算法
      let filterEditData = axiosParams(this.addTableData.filter(v=>v.opeType === 'edit')).map(v=>{return {...v,EVENT:'update',OPERAND:delParams(resetParams(v.OPERAND))}}) //编辑算法
      // let filterSortData = axiosParams(this.sortFormulaList.filter(v=>{
      //   const find = this.firstAddData.find(m=>m.FORMULA_KEY === v.FORMULA_KEY)
      //   return find && v.FORMULA_SEQ !== find.FORMULA_SEQ
      // })).map(v=>{return{...v,EVENT:'update'}})//算法排序
      let filterSortData = this.addTableData.filter(v=>{
        const findItem = this.firstAddData.find(m=>m.FORMULA_KEY === v.FORMULA_KEY)
        const isChange = findItem && v.FORMULA_SEQ !== findItem.FORMULA_SEQ
        return !v.opeType && isChange
      })
      filterSortData = filterSortData.map(v=>{
        const item = delParams([{...v}])[0]
        delete item.OPERAND
        return {...item,EVENT:'update'}
      })
      let filterDelData = axiosParams(this.delFormulaList).map(v=>{return{...v,EVENT:'delete'}})//删除的算法
      if(!this.formulaGroup[this.tableOptions.id]){//新增算法
        const res = await this.load(param, 'FORMULAGRP_MANAGEMENT#save')
        if(res.RETURN.RETURN_MSG !== "SUCCESS"){
          return
        }
        if(res.RETURN.RETURN_MSG === "SUCCESS"){//新增算法组和新增算法组下面的算法是两个接口 新增的时候  需要把算法组key 带到下面的编辑中
          filteraddData = filteraddData.map(v=>{return {...v,FORMULA_GRP_KEY:res.DATA}})
          filterEditData = filterEditData.map(v=>{return {...v,FORMULA_GRP_KEY:res.DATA}})
          filterDelData = filterDelData.map(v=>{return {...v,FORMULA_GRP_KEY:res.DATA}})
          filterSortData = filterSortData.map(v=>{return {...v,FORMULA_GRP_KEY:res.DATA}})
        }
      }
      // 更新算法组下面的算法时  需要同步更新算法组的更新时间  所以这里编辑算法组下面的算法后  需要同步调用算法的编辑接口
      let promises = [this.load([...filteraddData,...filterEditData,...filterDelData,...filterSortData],'FORMULAMAP_MANAGEMENT#update')]
      this.formulaGroup[this.tableOptions.id] ? promises = [...promises,this.load(delParams([this.formulaGroup])[0], 'FORMULAGRP_MANAGEMENT#updateWebApi')] : ''
      const res = await Promise.all(promises)
      if(res.every(v=>v === 'SUCCESS')){
        this.$show.execSuccess()
        this.$emit('initData',{reloadSearchData:false,reladFormula:true})
      }
    },
    // 删除算法组
    @getHasPrivTip('D')
    async toDel(data) {
      const isMutil = data === undefined // 判断是不是单个删除
      if(!isMutil && this.tableOptions.data[data].USE_STATE > 0){
        this.$show.openWarning(this.$t('v_notice_formula_cannot_be_delete'))
        return
      }
      await commonDel(!isMutil ? 1 : this.tableOptions.data.filter(v=>v.checked).length)
      let delIds = isMutil ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {FORMULA_GRP_KEY:+v[this.tableOptions.id],USE_STATE:v.USE_STATE}}) :  {FORMULA_GRP_KEY:+this.tableOptions.data[data][this.tableOptions.id],USE_STATE:this.tableOptions.data[data].USE_STATE}
      this.load(delIds, 'FORMULAGRP_MANAGEMENT#delete')
    },
    // 历史记录
    async toHistory(data){
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'FORMULA_VER_POP_LIST',
        COL_HIDDEN_YN:'N'
      })
      let formulaColumns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'FORMULA_VER_POP_FORMULA_EXP',
        COL_HIDDEN_YN:'N'
      })
      let oprdColumns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'FORMULA_VER_POP_OPRD',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      formulaColumns = [...resetParams((formulaColumns || []),true)]
      oprdColumns = [...resetParams((oprdColumns || []),true)]
      this.historyColumns =  {
        columns,
        formulaColumns,
        oprdColumns
      }
      const tableTypeResult = getTableType(columns)
      this.hisTimeArr = tableTypeResult.timeArr
      this.hisSwithArr = tableTypeResult.switchArr
      this.formulaDetail = []
      this.formulaGroup = {...searchRequireParams(this.searchForm,this.searchParams),...this.tableOptions.data[data]}
      await this.getformulaGroupType()
      await this.load({FORMULA_GRP_KEY:this.tableOptions.data[data].FORMULA_GRP_KEY},'FORMULAGRPVER_MANAGEMENT#selectEditTime')
      await this.historyList.length > 0 && this.expandFormula(this.historyList[0])
      this.showHistory = true
      this.addFomulaIsVisible(true)
    },
    // 历史记录详情
    expandFormula(row){
      this.load({EDIT_USER:row.EDIT_USER,EDIT_TIME:timeFormat(row.EDIT_TIME_orignal),FORMULA_GRP_KEY:this.formulaGroup.FORMULA_GRP_KEY},'FORMULAGRPVER_MANAGEMENT#selectWebApi')
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this)
    },
    //展开
    toExpand(index){
      this.load({FORMULA_GRP_KEY:this.tableOptions.data[index].FORMULA_GRP_KEY} ,'FORMULAMAP_MANAGEMENT#selectByGrp')
    },
    // 新增算法
    addFormula(data){
      const findIndex = this.findIndex(this.tableData,data.FORMULA_KEY)
      const findDelIndex = this.findIndex(this.delFormulaList,data.FORMULA_KEY)
      // 新增的数据是之前删除的数据 原来之前删除的数据就变为序号改变  相当于是拖拽
      if(findDelIndex > -1){
        this.delFormulaList.splice(findDelIndex,1) 
        // const sortHasFormulaIndex = this.findIndex(this.sortFormulaList,data.FORMULA_KEY)
        // const sortParams = {...data}
        // delete sortParams.OPERAND
        // sortHasFormulaIndex === -1 && this.sortFormulaList.push(sortParams)
        // this.sortFormulaList = this.sortFormulaList.filter(v=>this.firstAddData.findIndex(m=>m.FORMULA_SEQ === v.FORMULA_SEQ) === -1)
      }
      this.tableData.splice(findIndex,1)
      this.addTableData.push({
        ...data,
        FORMULA_GRP_KEY: this.formulaGroup[this.tableOptions.id],
        FAC_ID: this.searchParams.FAC_ID,
        OPERAND:data.OPERAND || [],
        FORMULA_SEQ:this.addTableData.length > 0 ? this.addTableData.length+1 : 1,
        ...(findDelIndex === -1 ? {EVENT:"save",opeType:'add'} : {})
      })
      if(this.addTableData.length === 1){
        this.$refs.formulaGroupRef.opeIndex = undefined
        this.$nextTick(()=>{
          this.$refs.formulaGroupRef.toExpendOperand(0)
        })
      }
    },
    // 删除算法
    delFormula(data){
      const findIndex = this.findIndex(this.addTableData,data.FORMULA_KEY)
      this.addTableData.splice(findIndex,1)
      //删除算法后  后面的算法就相当于自动排序了
      this.addTableData = this.addTableData.map((v,i)=>{
        let FORMULA_SEQ = i+1+''
        const item = delParams([{...v}])[0]
        // if(this.addTableData.length === 1 || i>=findIndex && v.opeType !== 'add'){
        //   const addParams = {...item}
        //   delete addParams.OPERAND
        //   const sortHasFormulaIndex = this.findIndex(this.sortFormulaList,data.FORMULA_KEY)  // 有就删除 没有就添加
        //   sortHasFormulaIndex === -1 ? this.sortFormulaList.push(addParams) : this.sortFormulaList.splice(sortHasFormulaIndex,1)
        //   if(this.sortFormulaList.length === 1){ // 说明实际拖拽生效的元素只有一个  没有实际意义
        //     this.sortFormulaList = []
        //   }
        // }
        return {...item,FORMULA_SEQ}
      })
      // this.tableData.splice((data.FORMULA_SEQ ? data.FORMULA_SEQ - 1 : 0),0,data) // 删除后就插入到原位置上
      this.tableData.push(data) // 删除后就插入到原位置上
      data.opeType !== 'add' && this.delFormulaList.push({EVENT:'delete',FORMULA_GRP_KEY:this.formulaGroup[this.tableOptions.id],FORMULA_MAP_KEY:data.FORMULA_MAP_KEY,FORMULA_KEY:data.FORMULA_KEY,FORMULA_SEQ:'-'+data.FORMULA_SEQ})
      if(findIndex === this.$refs.formulaGroupRef.opeIndex ){
        this.$refs.formulaGroupRef.opeIndex = undefined
        this.$nextTick(()=>{
          this.addTableData.length > 0 && this.$refs.formulaGroupRef.toExpendOperand(0)
        })
      }
    },
    // 筛选出匹配项的index
    findIndex(data,key){
      return data.findIndex(v=>v.FORMULA_KEY === key)
    },
    //添加算法数据重置
    resetGroupData(){
      this.addTableData = []
      this.tableData = []
      this.delFormulaList = []
      this.sortFormulaList = []
      this.addFomulaGroupVisible = false
      this.showHistory = false
      this.$refs.formulaGroupRef ? this.$refs.formulaGroupRef.opeIndex = undefined : ''
      for(let key in this.formulaGroup){
        this.formulaGroup[key] = ''
      }
    },
    // 拖拽排序  每拖拽一次交换顺序字段
    dragEnd(data){
      if(data.sort.newIdex === data.sort.oldIndex){
        return
      }
      const oldIndex = data.sort.oldIndex
      const newIdex = data.sort.newIndex
      let dragData = oldIndex > newIdex ? this.addTableData.slice(newIdex,oldIndex+1) : this.addTableData.slice(oldIndex,newIdex+1)
      dragData = this.swapItem((newIdex - oldIndex) > 0 ,dragData)
      // const isValid = !(dragData.length === 2 && dragData.filter(v=>v.opeType === 'add').length > 0)
      // isValid ? this.sortFormulaList = delParams(dragData.reduce((prev,v)=>{
      //   const findIndex = this.sortFormulaList.findIndex(m=>m.FORMULA_EXP === v.FORMULA_EXP)
      //   const item = {...v}
      //   delete item.OPERAND
      //   findIndex > -1 ? prev[findIndex] = item : prev.push(item)
      //   return prev
      // },this.sortFormulaList)) : ''
      const result = data.data.map(v=>{
        const findItem = dragData.find(m=>m.FORMULA_KEY === v.FORMULA_KEY)
        return {...v,FORMULA_SEQ:findItem ? findItem.FORMULA_SEQ : v.FORMULA_SEQ}
      })
      this.addTableData = result
    },
    //交换数组中的序号
    swapItem(orderRight,data){
      for(let i = orderRight ? 0 : data.length - 1; orderRight ? i<data.length-1 : i>=1; orderRight ? i++ : i--){
        const item = data[i]
        const FORMULA_SEQ = item.FORMULA_SEQ
        const tempIndex=orderRight ? +i+1:i-1
        item.FORMULA_SEQ = data[tempIndex].FORMULA_SEQ
        data[tempIndex].FORMULA_SEQ = FORMULA_SEQ
        data = this.swapArr(data,i,tempIndex)
      }
      return data
    },
    // 数组交换顺序
    swapArr(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0]
      return arr
    }
  },
  watch:{
    height:{
      immediate:true,
      handler(height){
        this.tableOptions.maxHeight = height
      }
    }
  }
}
</script>
