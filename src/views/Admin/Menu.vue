<template>
  <div class="device-parameter-contain">
    <div class="common-search-contain" v-if="searchForm.length > 0">
      <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
        <template>
          <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
          <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn(data,1)}" @submit="searchSubmit" @reset="(data)=>{searchFn(data,2)}" ref="searchRef"/>
        </template>
      </div>
      <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
        <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
      </span>
    </div>
    <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
      <SysMenuList :tableOptions="tableOptions" @handleTableChange="handleTableChange"/>
    </div>
    <el-dialog
      :visible.sync="addMenu"
      width="80%"
      :append-to-body="true"
      :before-close="()=>{resetData()}"
      class="form-dialog"
    >
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{menuData.type === 'edit' ? $t('v_dialog_title_edit_menu') : $t('v_dialog_title_add_menu')}}</div>
        </div>
      </span>
      <AddSysMenu :ruleForm="menuData" :tableColumn="tableColumn" ref="addForm"/>
      <span slot="footer">
        <el-button @click="resetData()">{{$t('btn_cancel')}}</el-button>
        <el-button type="primary" @click="addConfirm()">{{$t('btn_confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import AddSysMenu from './component/AddSysMenu'
import SysMenuList from './component/SysMenuList'
import { confirmTip,getHasPrivTip, getFuncID,addValidate,saveValidate,deleteValidata,searchValidata } from '@/commn/decoratorFn'
import { loadColumns,loadSearchColumns,resetSubmit,searchFn,getTableHeight } from '@/commn/comTable'
import { formatParam,axiosParams,objValueIsNull,getFinallyData,searchRequireParams,isDisable,getTree } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    AddSysMenu,
    SysMenuList,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      FUNC_ID :"",
      GRID_ID :"MENU",
      isCollapse: false,
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'MENU_ID',
        exportTitle:'',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[],
      },
      addMenu:false,
      menuData:{
        UPPER_MENU_ID:'0'
      },
      tableColumn:[],
      isAdd:false // 是否新增过
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Admin/Menu')
    async init(){
      loadSearchColumns.call(this)
      await loadColumns.call(this)
      const findIndex = this.tableOptions.columns.findIndex(v=>v.COL_NAME === 'UPPER_MENU_ID')
      this.tableOptions.columns.splice(findIndex,1)
      this.tableColumn = this.tableOptions.columns
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd(1)}],
        ["addmenu",() => {this.toAdd(1,data.data)}],
        ["edit",() => {this.toEdit(data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["page",() => {this.toAdd(2,false)}]
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
    // 父级不展示func_id VIEW_URL PATH 子级才展示func_id
    parentHidden(bool){
      const list = ['VIEW_URL','PATH','FUNC_ID']
      this.tableColumn = this.tableColumn.map(v=>{
        const visible = list.includes(v.COL_NAME) ? bool : true
        return {...v,visible}
      })
    },
    //加载列表数据
    async load(params = this.searchParams,type='MENU_MANAGEMENT#select'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'MENU_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          loadSearchColumns.call(this,true)
          this.toAdd(2,false)
        }
        return
      }
      let data = formatParam((res.DATA||[]),this.timeArr,this.switchArr,this.numberArr).map(v=>{return{...searchRequireParams(this.searchForm,this.searchParams),...v}})
      this.menuData.menus = [
        {
          value:'0',
          label:this.$t('v_dialog_title_main_menu'),
          children:data.filter(v=>v.UPPER_MENU_ID === '0').map(v=>{return{value:v.MENU_ID,label:this.$t(v.LABEL_ID)}})
        }
      ]
      this.tableOptions.data = this.isAdd ? [] : getTree(data)
      this.resetData()
    },
    //准备新增
    @addValidate()
    toAdd(type,data){
      type === 1 ? this.add(data) : this.searchSubmit(undefined,data)
    },
    // 新增
    @getHasPrivTip('C')
    async add(data){
      if(!(this.menuData && this.menuData.menus && this.menuData.menus.length > 0)){
        this.isAdd = true
        await this.load(this.searchParams,'MENU_MANAGEMENT#select')
      }
      this.parentHidden(!!data)
      this.menuData= {...this.menuData,UPPER_MENU_ID: data ? data.MENU_ID : '0',type: data ? 'addSub' : '',tableType:'add',USE_YN:false}
      this.addMenu = true
    },
    //新增/编辑确认
    addConfirm(){
      if(this.$refs.addForm && this.$refs.addForm.$refs.ruleForm){
        this.$refs.addForm.$refs.ruleForm.validate((valid)=>{
          if(!valid){
            return 
          }
          this.$refs.addForm.$refs.childForm.$refs.ruleForm.validate((childValid)=>{
            if(!childValid){
              return
            }
            const data = axiosParams([{...this.menuData}],this.switchArr,this.numberArr,this.specialkeyArr)
            data.forEach(v=>{
              v.UPPER_MENU_ID = Object.prototype.toString.call(v.UPPER_MENU_ID)=="[object String]" ? v.UPPER_MENU_ID : (v.UPPER_MENU_ID?.length > 0 ? v.UPPER_MENU_ID[v.UPPER_MENU_ID.length -1] : '0')
            })  
            this.load(data[0],data[0].type === 'edit' ? 'MENU_MANAGEMENT#update' : 'MENU_MANAGEMENT#save')
          })
        })
      }
    },
    //编辑
    @getHasPrivTip('U')
    toEdit(data){
      this.menuData = {...this.menuData,...data,type:'edit',tableType:'edit'}
      this.addMenu = true
      this.parentHidden(this.menuData.UPPER_MENU_ID !== '0')
      this.$refs?.addForm?.$refs?.childForm?.$refs?.ruleForm.clearValidate()
    },
    // 删除
    @getHasPrivTip('D')
    async toDel(data) {
      let delIds = [{[this.tableOptions.id]:data[this.tableOptions.id]}]
      if(data.children && data.children.length > 0){
        const ids = data.children.map(v=>v.MENU_ID)
        ids.forEach(v=>{
          delIds.push({[this.tableOptions.id]:v[this.tableOptions.id]})
        })
      }
      await this.$confirm(`${this.$t("v_confirm_del_confirm")}${data.MENU_NAME}${data.children && data.children.length > 0 ? this.$t('v_confirm_and_sub_menu'): ''}`,this.$t("v_confirm_tip"), {
        confirmButtonText: this.$t("btn_confirm"),
        cancelButtonText: this.$t("btn_cancel"),
        type: "warning",
      })
      this.load(delIds, 'MENU_MANAGEMENT#delete')
    },
    // table type重置
    resetData(){
      this.searchForm = isDisable(this.searchForm,false)
      this.addMenu = false
      this.isAdd = false
      for(let key in this.menuData){
        this.menuData[key] = key === 'menus' ? this.menuData[key] : ''
      }
      this.menuData = {...this.menuData,UPPER_MENU_ID:'0'}
      this.$refs?.addForm?.$refs?.childForm?.$refs?.ruleForm.clearValidate()
    },
  }
}
</script>
