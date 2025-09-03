import {colCascaderData,getColMap,searchFormSetting,addSelectOptions,columnsCellShow,filterButton,getTableType,resetParams,filterAction,isDisable,settingChecked,searchRequireParams,colSelectChange,selectChangeSetting,formatParam} from '@/commn/commonFn'
//搜索列
async function loadSearchColumns(reserveData=false){
  const searchForm = await getColMap({
    FUNC_ID:this.FUNC_ID,
    GRID_ID:this.GRID_ID,
    SEARCH_DISP_YN:'Y'
  })
  const res =  await searchFormSetting(resetParams((searchForm || []),true),this.searchParams,reserveData,this.FUNC_ID === 'F_ADM_FAC') 
  this.searchParams = {...this.searchParams,...res.params}
  this.searchForm = await columnsCellShow(res.data,this.searchParams,true) 
}
//列表列
async function loadColumns(){
  this.tableOptions.columns = []
  let columns = await getColMap({
    FUNC_ID:this.FUNC_ID,
    GRID_ID:this.GRID_ID,
    COL_HIDDEN_YN:'N'
  })
  columns = [...resetParams((columns || []),true)]
  const tableTypeResult = getTableType(columns)
  this.actions ? this.actions = tableTypeResult.actions : this.tableOptions.actions = tableTypeResult.actions
  this.timeArr = tableTypeResult.timeArr
  this.switchArr = tableTypeResult.switchArr
  this.numberArr = tableTypeResult.numberArr
  this.specialkeyArr = tableTypeResult.specialkeyArr
  columns = await addSelectOptions(columns,{...this.searchParams,R2R_MODEL_NAME:null,ENUM_VAL:this.FUNC_ID === 'F_PARA_MODEL' ? (this.searchParams.PARA_TYPE || null) : null}) // 获取select 下拉框数据
  columns = await columnsCellShow(columns,this.searchParams) // 单元cell的展示与隐藏根据搜索条件走
  this.tableOptions.columns = columns
  this.tableOptions.maxHeight = this.tableOptions.maxHeight || this.height
}
//请求数据后保持sort
function keepSort(){
  this.$nextTick(()=>{this.$refs.tableRef?.initSort()})
}
// 清楚sort状态
function clearSort(){
  this.$nextTick(()=>{this.$refs.tableRef?.clearSort()})
}
// table 重置
function resetData(button=['add']){
  this.tableOptions.data = this.tableOptions.data.map(v=>{return {...v,tableType:'',checked:false,disabled:false}})
  this.tableOptions.toolbarConfig.buttons = filterButton(button)
  this.tableOptions.actions = this.actions ? filterAction(this.actions.map(v=>v.code),this.actions) : this.tableOptions.actions
  this.height ? this.$emit('disableSearch',false) : this.searchForm = isDisable(this.searchForm,false)
}

//所有的条件控制
function filterAll(types=[],button=[],searchDisabled=false,checked = false,disabled=false){
  this.tableOptions.toolbarConfig.buttons = filterButton(button) //button
  this.tableOptions.actions = filterAction(types,this.actions) //actions
  this.height ? this.$emit('disableSearch',searchDisabled) : this.searchForm = isDisable(this.searchForm,searchDisabled) //搜索是否禁用
  this.tableOptions.data = settingChecked(this.tableOptions.data,checked) //是否回显勾选
  this.tableOptions.data = isDisable(this.tableOptions.data,disabled) //table是否禁用
}

// checkbox
function toCheckbox(data={}) {
  this.tableOptions.toolbarConfig.buttons = filterButton(['delete'])
  this.tableOptions.actions = filterAction(['del'],this.actions)
  this.height ? this.$emit('disableSearch',true) : this.searchForm = isDisable(this.searchForm,true)
  data.rowIndex === undefined 
    ? this.tableOptions.data = this.tableOptions.data.map(v=>{
      return {...v,checked:data.checked }
    })
    :changeTableType.call(this,data.rowIndex,{checked:data.checked})
  this.tableOptions.data.filter(v=>v.checked).length === 0 && (resetData.call(this)) //没有勾选 数据重置
}
// 改变table 单个 type
function changeTableType(rowIndex,data){
  this.$set(this.tableOptions.data,rowIndex,{...this.tableOptions.data[rowIndex],...data})
}
async function comEdit(rowIndex,types,buttons){
  filterAll.call(this,types,buttons,true,false,true)
  const newData = await colCascaderData([...this.tableOptions.columns],{...this.tableOptions.data[rowIndex],tableType:'edit',checked:true})
  changeTableType.call(this,rowIndex, {...newData})
}

//取消编辑
function toCancelEdit(data,button=['add']){
  const key = this.tableOptions.id
  const findIndex = this.editData.findIndex(v=>v[key] === this.tableOptions.data[data][key])
  this.$set(this.tableOptions.data,data,this.editData[findIndex])
  this.tableOptions.data.filter(v=>v.tableType).length === 0 && (resetData.call(this)) //没有编辑 数据重置
  resetData.call(this,button)
}
// 重置搜索条件
function resetSubmit(data={},button=undefined){
  this.searchParams = {...this.searchParams,...data}
  this.tableOptions.data = [] 
  // this.searchForm = clearSearchOption(this.searchForm,this.searchParams)
  const buttons = button ? button : (this.tableOptions?.toolbarConfig?.buttons || ['add'])
  resetData.call(this,buttons)
}

// 处理单条数据
function saveSignlData(isUpdateSignalID,data){
  const ROW_NUM = this.tableOptions.data.find(v=>v[this.tableOptions.id] === isUpdateSignalID)?.ROW_NUM || 1
  const findNewData = data.find(v=>v[this.tableOptions.id] === isUpdateSignalID) || {}
  const findOldIndex = this.tableOptions.data.findIndex(v=>v[this.tableOptions.id] === isUpdateSignalID)
  if(Object.keys(findNewData).length === 0 ){
    this.tableOptions.data.splice(findOldIndex,1)
  }else{
    const newData = {...findNewData,tableType:'',checked:false,disabled:false,ROW_NUM}
    this.$set(this.tableOptions.data,findOldIndex,newData)
  }
  this.tableOptions.data.filter(v=>v.checked).length === 0 && (resetData.call(this)) //没有勾选 数据重置
}

 // 重置table状态
function toResetTableStatus(button=['add']){
  this.tableOptions.data = this.editData
  resetData.call(this,button)
}

// 添加
async function addData(buttons,data={}){
  filterAll.call(this,[],buttons,true,false,true)
  let DISP_SEQ = this.tableOptions.data.length
  const addedData = {tableType: "add",checked:true,disabled:true,DISP_SEQ:DISP_SEQ+1,...searchRequireParams(this.searchForm,this.searchParams),ROW_NUM:DISP_SEQ+1,...data}
  if(this.tableOptions.columns.findIndex(v=>v.COL_NAME === 'USE_YN') > -1){
    addedData.USE_YN = true
  }
  const newData = await colCascaderData([...this.tableOptions.columns],{...addedData})
  this.tableOptions.data.unshift(newData)
  keepSort.call(this)
}

// 列表下拉框筛选
async function selectChange(data){
  const newData = await colSelectChange(data.name,this.tableOptions.columns,this.tableOptions.data[data.rowIndex])
  this.$set(this.tableOptions.data,data.rowIndex,{...newData})
}

// 搜索的change事件
async function searchFn(data){
  const areaIdSeq = data.key === 'AREA_ID' ? +(this.searchForm.find(v=>v.COL_NAME === 'AREA_ID').COL_DISP_SEQ) : ''
  const currentSeq = data.key === 'AREA_ID' ? +(this.searchForm.find(v=>v.COL_NAME === data.key).COL_DISP_SEQ) : '' // 当前key的序号
  // currentSeq < areaIdSeq  是用来判断AREA_ID 以上的项发生清除数据之后的情况
  if(data.key === 'AREA_ID' || currentSeq < areaIdSeq){
    this.searchForm = await columnsCellShow(this.searchForm,this.searchParams,true) 
  }
  const res = await selectChangeSetting(data.key,this.searchForm,this.searchParams)
  this.searchParams = res.params
  this.searchForm = res.data
}

//获取table高度
function getTableHeight(height=60,type){
  const dom = document.querySelector('.device-parameter')
  type ? this.height = (dom.offsetHeight - height)/2 : (this.tableOptions ? this.tableOptions.maxHeight = dom.offsetHeight-height : this.height = dom.offsetHeight - height)
}

// r2r 添加参数导入模板公共部分
async function comInitUnimport(GRID_ID,api='REFSPEC_MANAGEMENT#selectModel'){
  const { modelParaList } = this.$api.parameter
  let columns = await getColMap({
    FUNC_ID:this.FUNC_ID,
    GRID_ID,
    COL_HIDDEN_YN:'N'
  })
  columns = [...resetParams((columns || []),true)]
  const tableTypeResult = getTableType(columns)
  const timeArr = tableTypeResult.timeArr
  const switchArr = tableTypeResult.switchArr
  const res = await modelParaList({...this.searchParams,R2R_MODEL_NAME:null},'REFSPEC_MANAGEMENT#selectModel')
  const newData = formatParam((res.DATA||[]),timeArr,switchArr).map(v=>{
    const findData = this.tableOptions.data.find(m=>m.ID === JSON.stringify(v)) || {}
    return {...v,ID:JSON.stringify(v),checked:Object.keys(findData).length > 0,ADD_ROWS:1}
  })
  this.tableData.columns = columns
  this.$set(this.tableData,'data',newData)
}


// r2r 添加参数确认公共部分
function comAddPara(){
  this.selectData = this.$refs.addPara.getSelectData()
  if(this.selectData.length === 0){
    this.$show.openWarning(this.$t('v_notice_select_add_para'))
    return
  }
  filterAll.call(this,[],['add','save'],true,false,true)
  let DISP_SEQ = this.tableOptions.data.length
  const addParams = {...searchRequireParams(this.searchForm,this.searchParams),
    R2R_MODEL_NAME:this.searchParams.R2R_MODEL_NAME,
    USE_YN:true
  }
  this.selectData.forEach(async v=>{
    for(let i=1;i<=v.ADD_ROWS;i++){
      ++DISP_SEQ
      const newData = await colCascaderData([...this.tableOptions.columns],{...addParams,...v,DISP_SEQ,ROW_NUM:DISP_SEQ,tableType:'add',checked:true,disabled:true})
      this.tableOptions.data.unshift(newData)
    }
  })
  keepSort.call(this)
  this.dialogVisible = false
}

export {
  loadColumns,
  keepSort,
  clearSort,
  resetData,
  filterAll,
  loadSearchColumns,
  comEdit,
  toCancelEdit,
  saveSignlData,
  toResetTableStatus,
  addData,
  selectChange,
  searchFn,
  resetSubmit,
  toCheckbox,
  getTableHeight,
  comInitUnimport,
  comAddPara
}