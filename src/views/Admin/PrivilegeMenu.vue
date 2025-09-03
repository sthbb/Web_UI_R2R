<template>
  <div class="priv-menu-contain">
      <SysMenuList :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('v_priv_menu')}" @handleTableChange="handleTableChange" ref="sysMenuList"/>
      <el-dialog
        :visible.sync="addMenu"
        width="80%"
        :append-to-body="true"
        :before-close="()=>{resetDialog()}"
      >
        <span slot="title">
          <div class="diolag-box" :style="{background:$root.theme}">
            <div>{{tableOptions.data.length ===  0 ? $t('v_dialog_title_add_menu') :  $t('v_dialog_title_edit_menu')}}</div>
          </div>
        </span>
        <AddMenu :treeData="menuData" nodeKey="MENU_ID" ref="addMenu" :key="key" :searchParams="searchParams" :privSettingLists="privSettingLists" @selectPriv="selectPriv"/>
        <span slot="footer">
          <el-button @click="resetDialog()">{{ $t("btn_cancel") }}</el-button>
          <el-button type="primary" @click="addConfirm()">{{
            $t("btn_confirm")
          }}</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
import AddMenu from './component/AddMenu'
import SysMenuList from './component/SysMenuList'
import { getHasPrivTip } from '@/commn/decoratorFn'
import { filterAll } from "@/commn/comTable"
import {getColMap,resetParams,formatParam,columnsCellShow,axiosParams,addSelectOptions,getTree,getRequireSetting,filterButton,filterAction,searchFormSetting,objValueIsNull,privSort,getTableType,validate } from '@/commn/commonFn'
export default {
  props:{
    height:{
      type:Number,
      default:0
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
    AddMenu,
    SysMenuList
  },
  data() {
    return {
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id:'ID',
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_edit', icon: "fa fa-plus", status: "primary"}]
        },
        editRules:{},
        actions:[],
      },
      addMenu:false,
      menuData:{
        allMenu:[],
        menuList:[],
        expendKeys:[],
        checkKeys:[],
        privList:[],
        privData:{
          PRIV_BTN_TYPE:['C','R','U','D']
        },
        isPriv:true
      },
      editData:[],
      key:0,
      actions:[]
    }
  },
  async created() {},
  computed:{
    privSettingLists(){
      return [
        {label:this.$t('v_priv_c'),value:'C'},
        {label:this.$t('v_priv_r'),value:'R'},
        {label:this.$t('v_priv_u'),value:'U'},
        {label:this.$t('v_priv_d'),value:'D'}
      ]
    }
  },
  methods: {
    async initSearchData(reloadSearchData){
      reloadSearchData && await this.loadColumns()
      this.load()
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(data.data)}],
        ["cancel",() => {this.toCancelEdit(data.data)}],
        ["save",() => {this.toSave(data.data)}],
        ["page",() => {this.$emit('initData',{reloadSearchData:false})}],
        ["reset",() => {this.toResetTableStatus()}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载search列
    async loadSearchColumns(reserveData=false){
      const searchForm = await getColMap({
        FUNC_ID: this.FUNC_ID,
        GRID_ID:'PRIV_MENU',
        SEARCH_DISP_YN:'Y'
      }) || []
      const res =  await searchFormSetting(resetParams((searchForm || []),true),this.searchParams,reserveData) 
      this.$emit('toSearchForm',res)
    },
    // 加载table 列
    async loadColumns(){
      this.tableOptions.columns = []
      let columns = await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID:'PRIV_MENU',
        COL_HIDDEN_YN:'N'
      })
      columns = [...resetParams((columns || []),true)]
      const tableTypeResult = getTableType(columns)
      this.actions = tableTypeResult.actions
      this.timeArr = tableTypeResult.timeArr
      this.switchArr = tableTypeResult.switchArr
      this.numberArr = tableTypeResult.numberArr
      this.specialkeyArr = tableTypeResult.specialkeyArr
      columns = await addSelectOptions(columns,{...this.searchParams,R2R_MODEL_NAME:null}) // 获取select 下拉框数据
      columns = await columnsCellShow(columns,this.searchParams) // 单元cell的展示与隐藏根据搜索条件走
      columns = columns.map(v=>{
        const COL_TYPE = {
          name:'combobox',
          options:this.privSettingLists,
          props:{
            multiple:true
          }
        }
        return {...v,COL_TYPE:v.COL_NAME === 'PRIV_BTN_TYPE' ? COL_TYPE : v.COL_TYPE}
      })
      this.tableOptions.editRules = getRequireSetting(columns)
      this.tableOptions.columns = columns
      this.tableOptions.maxHeight = this.height
    },
    // 初始化数据
    async initData(){
      await this.loadSearchColumns()
      await this.loadColumns()
      this.load({},'MENU_MANAGEMENT#select')
      this.load({},'PRIV_MANAGEMENT#select')
    },
    //加载列表数据
    async load(params = this.searchParams,type='PRIVMENU_MANAGEMENT#getMenuByPriv',reload=true){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type === 'PRIV_MANAGEMENT#select'){//权限列表  
        this.menuData.privList = formatParam(res.DATA||[]).map(v=>{return {...v,label:v.PRIV_NAME,value:v.PRIV_ID}})
        return
      }
      if(type === 'MENU_MANAGEMENT#select'){ //获取所有菜单
        this.menuData.allMenu = formatParam(res.DATA||[])
        this.menuData.menuList = getTree(formatParam(res.DATA||[]))
        return
      }
      if(type === 'PRIVMENU_MANAGEMENT#delete'){
        if(reload){
          if(res.RETURN.RETURN_MSG === "SUCCESS"){
            this.$show.execSuccess()
            this.$emit('initData',{reloadSearchData:false})
          }
          return
        }
        return res.RETURN.RETURN_MSG
      }
      if(type !== 'PRIVMENU_MANAGEMENT#getMenuByPriv'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.$show.execSuccess()
          this.loadSearchColumns(true)
          reload && this.$emit('initData',{reloadSearchData:false})
          if(!reload && type === 'PRIVMENU_MANAGEMENT#update'){
            this.toCancelEdit(params[0],'',false)
          } 
        }
        return
      }
      const result = formatParam((res.DATA||[]),this.timeArr,this.switchArr,this.numberArr)
      let data = result.map(v=>{return{...this.searchParams,...v,ID:Math.random(),hasChild:result.findIndex(m=>m.UPPER_MENU_ID === v.MENU_ID) > -1, PRIV_BTN_TYPE:result.findIndex(m=>m.UPPER_MENU_ID === v.MENU_ID) === -1 ?  v.PRIV_BTN_TYPE : null}})
      this.tableOptions.data = getTree(data)
      this.editData = data.map(v=>Object.assign({},v))
      this.resetData()
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      this.resetData()
    },
    //准备新增
    toAdd(){
      this.$emit('emitAdd','2')
    },
    // 新增
    @getHasPrivTip('U')
    add(){
      this.addMenu = true
      this.key++
      this.menuData.privData = {...this.menuData.privData,...this.searchParams}
      this.menuData.privData.PRIV_ID && this.selectPriv(this.menuData.privData.PRIV_ID)
    },
    // 权限筛选
    async selectPriv(data){
      await this.load({PRIV_ID:data},'PRIVMENU_MANAGEMENT#getMenuByPriv')// 获取权限下的菜单
      this.menuData.privData = {...this.menuData.privData,PRIV_ID:data}
      this.menuData.menuList.forEach(v=>{
        v.hasExit = this.editData.findIndex(menu=>menu.MENU_ID === v.MENU_ID) > -1
        v.children.forEach(m=>{
          // m.disabled = this.editDataa.findIndex(menu=>menu.MENU_ID === m.MENU_ID) > -1
          m.hasExit = this.editData.findIndex(menu=>menu.MENU_ID === m.MENU_ID) > -1 // 菜单是否存在
        })
        v.hasAllChild = v.children.length > 0 ? v.children.filter(v=>v.hasExit).length === v.children.length : v.hasExit
        // v.disabled = v.children.length > 0 && v.children.every(v=>v.disabled)
        v.expend = v.children.filter(v=>v.hasExit).length > 0 // 子级有存在菜单就展开
      })
      // 父级菜单只有子级都选中的时候  才回显
      let checkKeys =  this.editData.filter(v=>v.UPPER_MENU_ID !== '0').map(m=>m. MENU_ID) 
      checkKeys = [...this.menuData.menuList.filter(v=>v.hasAllChild).map(m=>m.MENU_ID),...checkKeys]
      this.menuData.checkKeys = checkKeys
      this.menuData.expendKeys = this.menuData.menuList.filter(v=>v.expend).map(v=>v.MENU_ID)
      this.key++
    },
    //新增确认
    async addConfirm(){
      let treeIds = this.$refs?.addMenu?.$refs.tree.getCheckedKeys()
      const checkKeys = this.editData.map(v=>v.MENU_ID)
      const lotParentIds = [] // 若只选择了某一个子级  对应的父级也被选中
      this.menuData.menuList.forEach(v=>{
        treeIds.forEach(m=>{
          v.children.findIndex(k=>k.MENU_ID === m) > -1 && lotParentIds.push(v.MENU_ID)
        })
      })
      treeIds = [...new Set([...treeIds,...lotParentIds])]
      const privData = {...this.menuData.privData}
      const addMenus = treeIds.filter(v=>checkKeys.findIndex(m=>m === v) === -1)
      const delMenus = checkKeys.filter(v=>treeIds.findIndex(m=>m === v) === -1)
      const delIds = this.editData.filter(v=>delMenus.findIndex(m=>m === v.MENU_ID) > -1).map(k=>{return {PRIV_ID:k.PRIV_ID,MENU_ID:k.MENU_ID}})
      if(!privData.PRIV_ID){
        this.$show.openWarning(this.$t('v_notice_select_priv'))
        return
      }
      privData.PRIV_BTN_TYPE = privData.PRIV_BTN_TYPE && privData.PRIV_BTN_TYPE.length > 0 ?  privSort(privData.PRIV_BTN_TYPE || []) : 'XXXX'
      let addIds = []
      addMenus.forEach(k=> {
        const findData = this.menuData.allMenu.find(m=>m.MENU_ID === k)
        findData && addIds.push({MENU_ID:findData.MENU_ID,MENU_NAME:findData.MENU_NAME,SYS_ID:this.searchParams.SYS_ID,FAC_ID:this.searchParams.FAC_ID,PRIV_TYPE:'MENU',...privData})
      })
      if(addIds.length === 0 && delIds.length === 0 ){
        this.$show.openWarning(this.$t('v_notice_select_menu'))
        return
      }
      let res = delIds.length > 0 ? await this.load(delIds,'PRIVMENU_MANAGEMENT#delete',addIds.length === 0) : null 
      const needCheckDel = delIds.length > 0 ? res === 'SUCCESS' : true
      addIds.length > 0 && needCheckDel && await this.load(addIds,'PRIVMENU_MANAGEMENT#save')
      this.resetDialog()
    },
    //编辑
    @getHasPrivTip('U')
    toEdit(data){
      filterAll.call(this,['edit'],['save'],true,false,true)
      this.changeTableType(data,'edit')
      const findIndex = data.UPPER_MENU_ID === '0' ? this.tableOptions.data.findIndex(v=>v.ID === data.ID) : this.tableOptions.data.findIndex(v=>v.MENU_ID === data.UPPER_MENU_ID)
      setTimeout(()=>{
        this.$refs && this.$refs.sysMenuList && this.$refs.sysMenuList.expend(data.UPPER_MENU_ID !== '0' ? findIndex : undefined)
        // this.$refs && this.$refs.sysMenuList && this.$refs.sysMenuList.expend(findIndex)
        // if(this.$refs){
        //   const expends = this.$refs.sysMenuList.treeExpandRecords
        //   console.log(expends)
        //   var aaa = this.$refs.sysMenuList
        //   expends.length > 0 && aaa.$refs.xTable.setRowExpand([this.tableOptions.data[0],this.tableOptions.data[1]],true)
        // }
      })
    },
    //取消编辑
    toCancelEdit(data,isOriginal=true){
      const editDataIndex = this.editData.findIndex(v=>v.MENU_ID === data.MENU_ID)
      !isOriginal && editDataIndex > -1 && this.editData.splice(editDataIndex,1,data)
      this.changeTableType(data,'',isOriginal)
      let num = 0 
      this.tableOptions.data.forEach(v=>{
        v.tableType === 'edit' && num++
        v.children.forEach(m=>{
          m.tableType === 'edit' && num++
        })
      })
      if(num === 0){
        this.tableOptions.toolbarConfig.buttons = filterButton([{ code: "add", name: "btn_edit"}])
        this.tableOptions.actions = filterAction(this.actions.map(v=>v.code),this.actions)
        this.$emit('disableSearch',false)
      }
    },
    // 保存
    async toSave(data){
      const isMutil = data === undefined // 判断是不是单个删除
      let filterData = isMutil ? [] : [{...data,PRIV_BTN_TYPE:privSort(data.PRIV_BTN_TYPE || [])}]
      isMutil && this.tableOptions.data.forEach(v=>{
        v.tableType === 'edit' && filterData.push({...v,PRIV_BTN_TYPE:privSort(v.PRIV_BTN_TYPE || [])})
        v.children.forEach(m=>{
          m.tableType === 'edit' && filterData.push({...m,PRIV_BTN_TYPE:privSort(m.PRIV_BTN_TYPE || [])})
        })
      })
      if(validate(filterData,this.tableOptions.editRules,this.switchArr,isMutil)){
        return
      }
      filterData = axiosParams(filterData,this.switchArr,this.numberArr,this.specialkeyArr)
      this.load(filterData ,'PRIVMENU_MANAGEMENT#update',isMutil)
    },
    // 改变table 单个 type
    changeTableType(data,tableType,isOriginal){
      const isAllowEdit = this.tableOptions.columns.find(v=>v.COL_NAME === 'PRIV_BTN_TYPE')?.EDIT_ALLOW_YN === 'y'
      const originData = this.editData.find(v=>v.MENU_ID === data.MENU_ID)
      data.PRIV_BTN_TYPE = tableType === 'edit' && isAllowEdit && data.PRIV_BTN_TYPE ? data.PRIV_BTN_TYPE.split("").filter(v=>v!=='X') : (isOriginal ? originData.PRIV_BTN_TYPE : data.PRIV_BTN_TYPE) 
      this.tableOptions.data.forEach((v,index)=>{
        if(data.UPPER_MENU_ID === '0'){
          this.$set(this.tableOptions.data,index,{...(v.ID  === data.ID ? {...data,tableType} : v)})
        }else{
          v.children.forEach(m => {
            this.$set(m,'tableType' , m.ID === data.ID ? tableType : m.tableType)
            this.$set(m,'PRIV_BTN_TYPE' , m.ID === data.ID ? data.PRIV_BTN_TYPE : m.PRIV_BTN_TYPE)
          })
        }
      })
    },
    // table type重置
    resetData(){
      this.tableOptions.data = this.tableOptions.data.map(v=>{return {...v,tableType:'',children:v.children.map(m=>{return {...m,tableType:''}})}})
      this.tableOptions.toolbarConfig.buttons = filterButton([{ code: "add", name: "btn_edit"}])
      this.tableOptions.actions = filterAction(this.actions.map(v=>v.code),this.actions)
      this.$emit('disableSearch',false)
    },
    // 重置模态框
    resetDialog(){
      this.menuData.privData = {PRIV_BTN_TYPE:['C','R','U','D']}
      this.menuData = {...this.menuData,menuList:this.menuData.menuList.map(v=>{return {...v,hasExit:false,expend:false,children:v.children.map(m=>{return {...m,hasExit:false}})}}),expendKeys:[],checkKeys:[],privData:{PRIV_BTN_TYPE:['C','R','U','D']}}
      this.addMenu = false
    },
    // 重置table状态
    toResetTableStatus(){
      this.tableOptions.data = getTree(this.editData)
      this.resetData()
    }
  }
}
</script>

<style scoped lang="scss">
.priv-menu-contain{
  width: 100%;
}
</style>