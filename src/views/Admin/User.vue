<template>
  <div class="device-parameter-contain">
    <div class="common-search-contain" v-if="searchForm.length > 0">
      <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
        <template>
          <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
          <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit"  @reset="(data)=>{searchFn(data,2)}" ref="searchRef"/>
        </template>
      </div>
      <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
        <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
      </span>
    </div>
    <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
      <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef"/>
    </div>
    <el-dialog
      :visible.sync="showPassword"
      width="50%"
      :append-to-body="true"
      :before-close="()=>{showPassword = false}"
      :close-on-click-modal="false"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{userData.type ? $t('v_master_page_master_changepwd') : (userData.tableType === 'add' ? $t('v_dialog_title_add_user') :  $t('v_dialog_title_edit_user'))}}</div>
        </div>
      </span>
      <EditPassword v-if="userData.type" :ruleForm="userData" ref="addForm"/>
      <BaseTableForm v-if="!userData.type" :ruleForm="userData" :tableColumn="tableColumn" :addPassword="userData.tableType === 'add'" ref="addForm"/>
      <span slot="footer">
        <el-button @click="showPassword = false">{{$t('btn_cancel')}}</el-button>
        <el-button type="primary" @click="addConfirm()">{{$t('btn_confirm')}}</el-button>
      </span>
    </el-dialog>
    </div>
</template>

<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import BaseTable from "@/component/BaseTable"
import BaseTableForm from "@/component/BaseTableForm"
import EditPassword from './component/EditPassword'
import { confirmTip,getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,loadSearchColumns,toCheckbox,toCancelEdit,resetSubmit,toResetTableStatus,selectChange,searchFn,getTableHeight } from '@/commn/comTable'
import { axiosParams,objValueIsNull,getFinallyData,searchRequireParams } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    BaseTable,
    EditPassword,
    BaseTableForm,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID:"USER",
      isCollapse: false,
      specialkeyArr:[], //编辑时候 特殊参数
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'USER_ID',
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[],
      },
      showPassword:false,
      userData:{},
      tableColumn:[],
      hasPrivMenu:false,
      actions:[],
      editData:[]
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Admin/User')
    async init(){
      const routers = sessionStorage.getItem("User") && JSON.parse(sessionStorage.getItem("User"))?.router || []
      this.hasPrivMenu = routers.find(v=>v.VIEW_URL === 'Admin/PrivilegeManager') ? true : false
      loadSearchColumns.call(this)
      await loadColumns.call(this)
      this.tableColumn = [...this.tableOptions.columns]
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
        ["password",() => {this.toPassword(data.data)}],
        ["resetpassword",() => {this.toResetPassword(data.data)}],
        ["jumpusermenu",() => {this.toJump(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}],
        ["selectChange",async () => {selectChange.call(this,data.data)}],
        ["reset",() => {toResetTableStatus.call(this)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 搜索的事件
    async searchFn(data,type){
      type === 1 ? searchFn.call(this,data) : resetSubmit.call(this,data)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true){
      this.searchParams = {...this.searchParams,...data}
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // 清除表单验证
    clearValidate(){
      this.$nextTick(()=>{
        this.$refs?.addForm?.$refs?.ruleForm.clearValidate()
      })
    },
    //加载列表数据
    async load(params = this.searchParams,type='USERS_MANAGEMENT#select'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'USERS_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          loadSearchColumns.call(this,true)
           this.showPassword = false
          this.toAdd(false,false)
        }
        return
      }
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      this.editData = this.tableOptions.data.map(v=>Object.assign({},v))
      clearSort.call(this)
      resetData.call(this)
    },
    //准备新增
    @addValidate()
    toAdd(isAdd=true,reloadSearchData){
      isAdd ? this.add() : this.searchSubmit(undefined,reloadSearchData)
    },
    // 新增
    @getHasPrivTip('C')
    add(){
      let DISP_SEQ = this.tableOptions.data.length
      this.userData= {...searchRequireParams(this.searchForm,this.searchParams),tableType:'add',ROW_NUM:++DISP_SEQ}
      this.showPassword = true
      this.clearValidate()
    },
    //新增确认
    addConfirm(){
      if(this.$refs.addForm && this.$refs.addForm.$refs.ruleForm){
        this.$refs.addForm.$refs.ruleForm.validate((valid)=>{
          if(!valid){
            return 
          }
          !this.userData.type && this.load(axiosParams([this.userData],this.switchArr,this.numberArr,this.specialkeyArr)[0], this.userData.tableType === 'edit' ? 'USERS_MANAGEMENT#update' : 'USERS_MANAGEMENT#save')
          if(this.userData.type){
            if(this.userData.PWD_AGAIN !== this.userData.PWD_NEW){
              this.$show.openWarning(this.$t('v_dialog_two_passwords_is_not_match'))
              return
            }
            this.load({USER_ID:this.userData.USER_ID,PWD_OLD:this.userData.PWD_OLD,PWD_NEW:this.userData.PWD_NEW}, 'USERS_MANAGEMENT#updatePwd')
          }
        })
      }
    },
    //编辑
    @getHasPrivTip('U')
    toEdit(rowIndex){
      this.clearValidate()
      this.userData= {...this.tableOptions.data[rowIndex],tableType:'edit'}
      delete this.userData.PASSWORD
      this.showPassword = true
    },
    // 删除
    @getHasPrivTip('D')
    @deleteValidata()
    async toDel(data) {
      let delIds = data === undefined ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {[this.tableOptions.id]:v[this.tableOptions.id]}}) :  {[this.tableOptions.id]:this.tableOptions.data[data][this.tableOptions.id]}
      this.load(delIds, 'USERS_MANAGEMENT#delete')
    },
    // 修改密码
    @getHasPrivTip('U')
    toPassword(data){
      this.userData = {...this.tableOptions.data[data],type:'editPassword'}
      this.showPassword = true
    },
    // 重置密码
    @getHasPrivTip('U')
    @confirmTip('v_confirm_whether_reset_password')
    async toResetPassword(index){
      const data = axiosParams([{...this.tableOptions.data[index],PASSWORD:'123456'}],this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(data,'USERS_MANAGEMENT#update')
    },
    // 用户菜单
    toJump(data){
      sessionStorage.setItem("privilege",JSON.stringify({type:'4',data:{USER_ID:this.tableOptions.data[data].USER_ID}}))
      this.$router.push({path:'/Privilege'})
    }
  }
}
</script>