<template>
  <div class="r2r-model-spec">
    <div class="m-b-10">
      <BaseTitle :title="$t('v_r2rspec_r2r_model_spec')" class="m-r-10"/>
      <el-button @click="toCopy" icon="el-icon-document-copy" :disabled="getDisabled" v-if="tableOptions.data.length > 0 && tableOptions.data[0].PROC_MODE && !tableOptions.data[0].tableType">{{$t('btn_copy')}}</el-button>
      <el-button @click="deleteAll" icon="el-icon-delete" :disabled="getDisabled" v-if="tableOptions.data.length > 0 && tableOptions.data[0].PROC_MODE && !tableOptions.data[0].tableType">{{$t('btn_delete_all')}}</el-button>
    </div>
    <BaseTable :tableOptions="tableOptions"  @handleTableChange="handleTableChange" ref="tableRef"/>
    <el-dialog
      :visible.sync="dialogVisible"
      width="80%"
      :append-to-body="true"
      :before-close="()=>{dialogVisible = false;isCopy = false}"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{isCopy ? $t('v_dialog_title_copy') : $t('v_dialog_title_view_history')}}</div>
        </div>
      </span>
      <CopyR2RSpec :r2rSpecObj=r2rSpecObj v-if="isCopy" ref="copyR2rSpec" @selects="(data)=>{selects = data}"/>
      <ViewHistory v-else ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="R2RMODELSPECHIST_MANAGEMENT#select" />
      <span slot="footer">
        <template v-if="isCopy">
          <el-button @click="dialogVisible = false;isCopy = false">{{$t('btn_cancel')}}</el-button>
          <el-button type="primary" @click="confirmCopy" :disabled="selects.length === 0">{{$t('btn_confirm')}}</el-button>
        </template>
        <el-button type="primary" @click="dialogVisible = false;isCopy = false" v-else>{{$t('btn_close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import ViewHistory from './ViewHistory'
import CopyR2RSpec from './CopyR2RSpec'
import BaseTitle from '@/component/BaseTitle'
import { confirmTip,getHasPrivTip,saveValidate,deleteValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,comEdit,toCancelEdit,toResetTableStatus,selectChange } from '@/commn/comTable'
import { axiosParams,getFinallyData,objValueIsNull,filterAction } from '@/commn/commonFn'
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
    activeTab:{
      type:String,
      default:'1'
    }
  },
  components: {
    BaseTable,
    ViewHistory,
    CopyR2RSpec,
    BaseTitle
  },
  data() {
    return {
      GRID_ID:'R2R_MODEL_SPEC',
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id: "R2R_MODEL_KEY",
        columns: [],
        data: [],
        toolbarConfig: { //table上面的操作
          buttons: [],
          import: false,
          export: false,
          print: false,
          zoom: false,
          custom: false,
          refresh:false,
        },
        editRules:{
          R2R_YN: [{ required: true, message: ''}],
          SAMPLE_YN: [{ required: true, message: ''}],
          NPW_YN: [{ required: true, message: ''}],
          FIX_ONLY_YN: [{ required: true, message: ''}],
          AUTO_SP_YN: [{ required: true, message: ''}],
        },
        actions:[]
      },
      editData:[],
      actions:[],
      tempColumns:[],
      dialogVisible:false,
      isCopy:false,
      r2rSpecObj:{},
      selects:[]
    }
  },
  computed:{
    getDisabled() {
      const filter = this.searchForm.filter((v) => v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y'))
      return filter.length > 0 && filter.length === this.searchForm.length
    }
  },
  methods: {
    // 获取数据
    async initData(reloadSearchData,isUpdateSignalID){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {toCancelEdit.call(this,data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["history",() => {this.toHistory(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载列表
    async load(params = {...this.searchParams,R2R_MODEL_NAME:'R2R_MODEL_SPEC'},type='R2RMODELSPEC_MANAGEMENT#selectWebApi',isUpdateSignalID){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type === 'R2RMODEL_MANAGEMENT#copy'){
        return res
      }
      if(type === 'R2RMODEL_MANAGEMENT#deleteModel'){
        return res
      }
      if(type !== 'R2RMODELSPEC_MANAGEMENT#selectWebApi'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          this.$emit('initData',{reloadSearchData:false})
        }
        return
      } 
      const data = res.DATA || []
      data.length === 0 && data.unshift({PROC_MODE:'',R2R_YN:'',SAMPLE_YN:'',NPW_YN:'',FIX_ONLY_YN:'',AUTO_SP_YN:'',REMARK:'',R2R_MODEL_KEY:0})
      const result = getFinallyData(data,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams).map(v=>{return {...v,R2R_MODEL_NAME:this.searchParams.R2R_MODEL_NAME}})
      this.editData = result.map(v=>Object.assign({},v))
      this.tableOptions.data = result
      clearSort.call(this)
      resetData.call(this,[])
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this,[])
    },
    //编辑
    @getHasPrivTip('U')
    async toEdit(rowIndex){
      comEdit.call(this,rowIndex,['edit'])
    },
    // 保存
    @saveValidate()
    async toSave(data){
      let filterData = data === undefined ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[data]}]
      const key = this.tableOptions.data[0].R2R_MODEL_KEY
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr).map(v=>{return {...v,R2R_MODEL_NAME:'R2R_MODEL_SPEC'}})//删除接口不需要的参数 和 switch 处理
      this.load(filterData[0], !key ? 'R2RMODELSPEC_MANAGEMENT#saveWebApi' : 'R2RMODELSPEC_MANAGEMENT#update',data !== undefined ? this.tableOptions.data[data][this.tableOptions.id] : data)
    },
    // 历史
    async toHistory(index){
      const key = this.tableOptions.id
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.viewHistory.initData({[key]:this.tableOptions.data[index][key]})
      })
    },
    //准备复制
    toCopy(){
      this.$emit('emitAdd','0')
    },
    // 复制
    @getHasPrivTip('C')
    copy(){
      this.dialogVisible = true
      this.isCopy=true
      this.r2rSpecObj = {...this.searchParams,EQP_ID_OLD:this.searchParams.EQP_ID,RECIPE_ID_OLD:this.searchParams.RECIPE_ID,copyObj:1}
      this.$nextTick(()=>{
        this.$refs.copyR2rSpec.getRecipeOrEqpList()
      })
    },
    // 一键删除
    @getHasPrivTip('D')
    @confirmTip('v_confirm_R2R_PARA_is_delete')
    async deleteAll(){
      const res = await this.load({...this.searchParams},'R2RMODEL_MANAGEMENT#deleteModel',false)
      if(res.RETURN.RETURN_MSG === "SUCCESS"){
        this.$show.execSuccess()
        this.$emit('initData',{reloadSearchData:false})
      }
    },
    //复制confirm
    async confirmCopy(){
      const params = axiosParams(this.selects.map(v=>{return {...v,...this.r2rSpecObj,EQP_ID_NEW: this.r2rSpecObj.copyObj === 1 ? v.EQP_ID : null,RECIPE_ID_NEW: this.r2rSpecObj.copyObj === 2 ? v.RECIPE_ID : null}}),['R2R_YN','SAMPLE_YN'])
      const res = await this.load(params,'R2RMODEL_MANAGEMENT#copy',false)
      if(res.RETURN.RETURN_MSG === "SUCCESS"){
        this.$show.execSuccess()
        this.dialogVisible = false
        this.isCopy = false
      }
    }
  },
  watch:{
    activeTab:{
      immediate:true,
      deep:true,
      handler(newData){
        // this.activeTab === '5' 时不展示操作栏  其余均展示操作栏
        const isHasAction = this.tableOptions.columns.findIndex(v=>v.COL_NAME === 'ACTION_BAR') > -1
        this.tableOptions.actions = filterAction(newData === '5' ? [] :this.actions.map(v=>v.code),this.actions)
        this.tableOptions.columns = newData === '5' ? this.tableOptions.columns.slice(0,this.tableOptions.columns.length - 1) : (isHasAction ? [...this.tableOptions.columns] : [...this.tableOptions.columns,...this.tempColumns]) 
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .r2r-model-spec{
    padding: 10px;
    // box-shadow: 0px 2px 5px rgba(0, 21, 41, 0.08);
    border:1px solid #d8e1e9;
    border-radius: 3px;
  }
</style>
