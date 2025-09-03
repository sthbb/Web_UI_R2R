<template>
  <div class="device-parameter-contain">
      <div class="common-search-contain" v-if="searchForm.length > 0">
        <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']">
          <template>
            <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
            <BaseSearch :data="searchForm" :params="searchParams" @emitChild="searchFn" @submit="searchSubmit" @reset="resetSubmit" ref="searchRef"/>
          </template>
        </div>
        <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
          <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
        </span>
      </div>
      <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
        <BaseTabs :activeTab="activeTab" :tabs="tabs" @childEmit="(item)=>{handleTab(item)}" class="m-b-10"/>
        <Privilege :searchParams="searchParams" :searchForm="searchForm" :height="height" @emitAdd="toAdd" @disableSearch="disableSearch"  @initData="(data)=>{toAdd(activeTab,false,data.reloadSearchData,data.isUpdateSignalID)}" @toSearchForm="(data)=>{toSearchForm(data,'1')}" ref="priv" :FUNC_ID="FUNC_ID" :title="title" v-show="FUNC_ID && activeTab === '1'" @toJump="toJump"/>
        <PrivilegeMenu :searchParams="searchParams" :height="height" @emitAdd="toAdd" @disableSearch="disableSearch" @initData="(data)=>{toAdd(activeTab,false,data.reloadSearchData)}" @toSearchForm="(data)=>{toSearchForm(data,'2')}" ref="privMenu" :FUNC_ID="FUNC_ID" :title="title" v-show="FUNC_ID && activeTab === '2'"/>
        <UserPrivilege :searchParams="searchParams" :searchForm="searchForm" :height="height" @emitAdd="toAdd" @disableSearch="disableSearch" @initData="(data)=>{toAdd(activeTab,false,data.reloadSearchData)}" @toSearchForm="(data)=>{toSearchForm(data,'3')}" ref="privUser" :FUNC_ID="FUNC_ID" :title="title" v-show="FUNC_ID && activeTab === '3'"/>
        <UserPrivilegeMenu :searchParams="searchParams" :height="height" @emitAdd="toAdd" @disableSearch="disableSearch" @initData="(data)=>{toAdd(activeTab,false,data.reloadSearchData)}" @toSearchForm="(data)=>{toSearchForm(data,'4')}" ref="userMenu" :FUNC_ID="FUNC_ID" :title="title" v-show="FUNC_ID && activeTab === '4'"/>
      </div>
    </div>
</template>

<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import Privilege from './Privilege'
import PrivilegeMenu from './PrivilegeMenu'
import UserPrivilege from './UserPrivilege'
import UserPrivilegeMenu from './UserPrivilegeMenu'
import BaseTabs from "@/component/BaseTabs"
import { getHasPrivTip,getFuncID,addValidate,searchValidata } from '@/commn/decoratorFn'
import { isDisable,selectChangeSetting,toResetSearch,getHasPriv } from '@/commn/commonFn'
import { getTableHeight,searchFn } from "@/commn/comTable"
export default {
  components: {
    BaseSearch,
    Privilege,
    PrivilegeMenu,
    UserPrivilege,
    UserPrivilegeMenu,
    BaseTabs,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{},
      isCollapse:false,
      activeTab:'1',
      height:0,
      FUNC_ID:'',
      title:'',
      tabs:[
        {label:'v_dialog_title_priv',name:'1'},
        {label:'v_priv_menu',name:'2'},
        {label:'v_priv_user',name:'3'},
        {label:'v_priv_user_menu',name:'4'}
      ]
    }
  },
  async created() {
    this.initData(false)
  },
  mounted(){
    getTableHeight.call(this,100)
  },
  methods: {
    // 加载数据
    @getFuncID('Admin/PrivilegeManager')
    async initData(isLoadData=true){
      this.$nextTick(async()=>{
        const ref = this.getRef(this.activeTab)
        await ref.initData()
        isLoadData && this.toAdd(this.activeTab,false,false)
      })
    },
    //加载搜索条件
    async toSearchForm(result=[],type){
      if(type === this.activeTab){
        this.searchForm = result.data
        this.searchParams = {...this.searchParams,...result.params}
        // this.FUNC_ID = result.FUNC_ID
      }
    },
    // 搜索的change事件
    async searchFn(data){
     searchFn.call(this,data)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    async searchSubmit(data={},reloadSearchData=true,isUpdateSignalID){
      this.searchParams = {...this.searchParams,...data}
      this.$nextTick(()=>{
        const ref = this.getRef(this.activeTab)
        ref.initSearchData(reloadSearchData,isUpdateSignalID)
      })
    },
    // 重置搜索条件
    resetSubmit(data={}){
      this.searchParams = {...this.searchParams,...data}
      this.$nextTick(()=>{
        const ref = this.getRef(this.activeTab)
        ref.resetInitData()
      })
    },
    //获取tab对应的ref
    getRef(type){
      const typeArr = new Map([
        ['1','priv'],
        ['2','privMenu'],
        ['3','privUser'],
        ['4','userMenu'],
      ])
      return typeArr.get(type) && this.$refs[typeArr.get(type)]
    },
    //准备新增
    @addValidate()
    toAdd(type=this.activeTab,isAdd = true,reloadSearchData,isUpdateSignalID){
      const ref = this.getRef(type)
      isAdd  ? ref.add() : this.searchSubmit(undefined,reloadSearchData,isUpdateSignalID)
    },
    // 切换tab
    handleTab(item){
      this.activeTab = item
      toResetSearch(this.searchParams,this.searchForm)
      this.getRef(this.activeTab).resetInitData()
      this.$nextTick(()=>{
        this.$refs.searchRef && this.$refs.searchRef.$refs[this.$refs.searchRef._props.searchRef].clearValidate()
        if(!getHasPriv(this.FUNC_ID,'R')){
          return
        }
        this.initData()
      })
    },
    //是否禁用搜索框
    disableSearch(bool){
      this.searchForm = isDisable(this.searchForm,bool)
    },
    // 菜单跳转
    toJump(jumpData){
      this.activeTab = jumpData.type
      this.searchParams = {...this.searchParams,...jumpData.data}
      this.initData()
    }
  },
  watch:{
    $route:{
      handler(to,from){
        if(sessionStorage.getItem("privilege")){
          const privilege = JSON.parse(sessionStorage.getItem("privilege")) 
          this.activeTab = privilege.type
          this.searchParams = {...this.searchParams,...privilege.data}
          sessionStorage.removeItem("privilege")
          this.initData()
        }
      },
      // 深度观察监听
      deep: true,
      immediate:true
    }
  }
}
</script>