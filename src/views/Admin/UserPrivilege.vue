<template>
  <div class="priv-user-contain">
    <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('v_priv_user')}" @handleTableChange="handleTableChange" />
    <el-dialog
      :visible.sync="addUser"
      width="80%"
      :append-to-body="true"
      :before-close="()=>{addUser = false}"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{tableOptions.data.length ===  0 ? $t('v_dialog_title_add_user') :  $t('v_dialog_title_update_user')}}</div>
        </div>
      </span>
      <AddUser :addUserData="addData" ref="addUser" @selectPriv="selectPriv" :searchParams="searchParams" />
      <span slot="footer">
        <el-button @click="addUser = false">{{ $t("btn_cancel") }}</el-button>
        <el-button type="primary" @click="addConfirm()">{{
          $t("btn_confirm")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from "@/component/BaseTable"
import AddUser from "./component/AddUser"
import { getHasPrivTip } from '@/commn/decoratorFn'
import { loadColumns,resetData,toResetTableStatus } from '@/commn/comTable'
import { getColMap,resetParams,formatParam,axiosParams,searchFormSetting,objValueIsNull,getFinallyData } from "@/commn/commonFn"
export default {
  props: {
    height: {
      type: Number,
      default: 0,
    },
    searchForm:{
      type:Array,
      default:()=>{return []}
    },
    searchParams: {
      type: Object,
      default: () => {
        return {}
      },
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
    AddUser
  },
  data() {
    return {
      GRID_ID: "PRIV_USER",
      specialkeyArr:[],
      timeArr: [],
      switchArr: [],
      numberArr: [], //number类型集合
      tableOptions: {
        id: "USER_ID",
        columns: [],
        data: [],
        toolbarConfig: {
          buttons: [{code: "add",name: "btn_edit",icon: "fa fa-plus",status: "primary"}]
        },
        editRules: {},
        actions: [],
      },
      addUser:false,
      addData:{
        addTableData:[],//已有用户
        tableData:[],//未添加的用户,
        privList:[],//权限列表
        PRIV_ID:''
      },
      actions:[],
      editData:[]
    }
  },
  async created() {},
  computed: {},
  methods: {
    async initSearchData(reloadSearchData){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["page",() => {this.$emit('initData',{reloadSearchData:false})}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载search列
    async loadSearchColumns(reserveData=false){
      const searchForm = await getColMap({
        FUNC_ID: this.FUNC_ID,
        GRID_ID:'PRIV_USER',
        SEARCH_DISP_YN:'Y'
      }) || []
      const res =  await searchFormSetting(resetParams((searchForm || []),true),this.searchParams,reserveData) 
      this.$emit('toSearchForm',res)
    },
    // 初始化数据
    async initData(){
      await this.loadSearchColumns()
      await loadColumns.call(this)
      this.load({},'PRIV_MANAGEMENT#select')
    },
    //加载列表数据
    async load(params = this.searchParams,type = "USERPRIV_MANAGEMENT#select",reload=true) {
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res = await modelParaList(params, type)
      if(type === 'PRIV_MANAGEMENT#select'){//权限列表  
        this.addData.privList = formatParam(res.DATA||[]).map(v=>{return {...v,label:v.PRIV_NAME,value:v.PRIV_ID}})
        return
      }
      if(type === 'USERPRIV_MANAGEMENT#getAvailableUserByPriv'){//未导入的用户
        this.addData.tableData = formatParam(res.DATA || []).map((v,i)=>{return{...v,ROW_NUM:i+1,checked:false}})
        return
      }
      if(type === 'USERPRIV_MANAGEMENT#getUserByPriv'){//已导入的用户
        this.addData.addTableData = formatParam(res.DATA || []).map((v,i)=>{return {...v,ROW_NUM:i+1,checked:false}})
        return
      }
      if (type !== "USERPRIV_MANAGEMENT#select") {
        return res.RETURN.RETURN_MSG === "SUCCESS" ? Promise.resolve('SUCCESS') : Promise.reject('FAIL')
      }
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      this.editData = this.tableOptions.data.map((v) => Object.assign({}, v))
      resetData.call(this,[{ code: "add", name: "btn_edit"}])
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this,[{ code: "add", name: "btn_edit"}])
    },
    //准备新增
    toAdd() {
      this.$emit("emitAdd", "3")
    },
    // 切换权限
    selectPriv(data=null){
      this.addData.PRIV_ID = data
      this.load({PRIV_ID:data},'USERPRIV_MANAGEMENT#getAvailableUserByPriv')
      this.load({PRIV_ID:data},'USERPRIV_MANAGEMENT#getUserByPriv')
    },
    // 新增
    @getHasPrivTip('U')
    add() {
      this.addData.PRIV_ID = this.searchParams.PRIV_ID || ''
      if(this.addData.PRIV_ID){
        this.selectPriv(this.addData.PRIV_ID)
      }else{
        this.addData.tableData = []
        this.addData.addTableData = []
      }
      this.addUser = true
      this.$nextTick(()=>{
        this.$refs.addUser?.$refs?.transfer.clear()
      })
    },
    // 确认添加
    async addConfirm(){
      const oldUsers = this.addData.addTableData
      const newUsers = this.$refs.addUser?.$refs?.transfer?.tableRight?.data || []
      const addUserIds = newUsers.filter(v=>oldUsers.findIndex(m=>m.USER_ID === v.USER_ID) === -1).map(o=>{return {USER_ID:o.USER_ID,USER_NAME:o.USER_NAME,SYS_ID:this.searchParams.SYS_ID,FAC_ID:this.searchParams.FAC_ID,PRIV_TYPE:'MENU',PRIV_ID:this.addData.PRIV_ID}})
      const delUserIds = oldUsers.filter(v=>newUsers.findIndex(m=>m.USER_ID === v.USER_ID) === -1).map(o=>{return {USER_ID:o.USER_ID,PRIV_ID:this.addData.PRIV_ID}})
      if(!this.addData.PRIV_ID){
        this.$show.openWarning(this.$t('v_notice_select_priv'))
        return false
      }
      if(addUserIds.length === 0  && delUserIds.length === 0){
        this.$show.openWarning(this.$t('v_notice_update_user'))
        return false
      }
      let promises = []
      if(addUserIds.length > 0 && delUserIds.length > 0){
        promises = [this.load(delUserIds,'USERPRIV_MANAGEMENT#delete'),this.load(addUserIds,'USERPRIV_MANAGEMENT#save')]
      }else if(addUserIds.length > 0){
        promises = [this.load(addUserIds,'USERPRIV_MANAGEMENT#save')]
      }else{
        promises = [this.load(delUserIds,'USERPRIV_MANAGEMENT#delete')]
      }
      const res = await Promise.all(promises)
      if(res.every(v=>v === 'SUCCESS')){
        this.$show.execSuccess()
        this.loadSearchColumns()
        this.addUser = false
        this.$emit("initData",{reloadSearchData:false})
      }
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-table__body{
  width:100%;
}
.priv-user-contain{
  width: 100%;
}
</style>