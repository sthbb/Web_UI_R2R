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
      <div class="m-b-10">
        <R2RModel :searchParams="searchParams" :searchForm="searchForm" ref="r2rModelSpec" @disableSearch="disableSearch" :height="height" @initData="(data)=>{toAdd('0',false,data.reloadSearchData,data.isUpdateSignalID)}" @emitAdd="toAdd" :FUNC_ID="FUNC_ID" :activeTab="activeTab" v-if="FUNC_ID"/>
      </div>
      <div>
        <BaseTabs :activeTab="activeTab" :tabs="tabs" @childEmit="(item)=>{handleTab(item)}" class="m-b-10"/>
        <CurrentR2RPara :searchParams="searchParams" :searchForm="searchForm" @emitAdd="toAdd" ref="currentParaSpec" @disableSearch="disableSearch" :height="height"  @initData="(data)=>{toAdd('1',false,data.reloadSearchData,data.isUpdateSignalID)}" :FUNC_ID="FUNC_ID" :title="title" v-if="FUNC_ID && activeTab === '1'"/>
        <R2RPara :searchParams="searchParams" :searchForm="searchForm" ref="r2rParaSpec" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" @initData="(data)=>{toAdd('2',false,data.reloadSearchData,data.isUpdateSignalID)}" :title="title" v-if="FUNC_ID  && activeTab === '2'"/>
        <R2RCondition :searchParams="searchParams" :searchForm="searchForm" @emitAdd="toAdd" ref="r2rCond" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" @initData="(data)=>{toAdd('3',false,data.reloadSearchData,data.isUpdateSignalID)}" :title="title" v-if="FUNC_ID && activeTab === '3'"/>
        <DcolFilter :searchParams="searchParams" :searchForm="searchForm" @emitAdd="toAdd" ref="dataFilter" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" @initData="(data)=>{toAdd('4',false,data.reloadSearchData,data.isUpdateSignalID)}" :title="title" v-if="FUNC_ID  && activeTab === '4'"/>
        <RefenceSpec :searchParams="searchParams" :searchForm="searchForm" @emitAdd="toAdd" ref="refSpec" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" @initData="(data)=>{toAdd('5',false,data.reloadSearchData,data.isUpdateSignalID)}" :title="title" v-if="FUNC_ID  && activeTab === '5'"/>
        <!-- <ProcessSpec :searchParams="searchParams" :searchForm="searchForm" @emitAdd="toAdd" ref="processSpec" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" @initData="(data)=>{toAdd('6',false,data.reloadSearchData,data.isUpdateSignalID)}" :title="title" v-if="FUNC_ID  && activeTab === '6'"/> -->
      </div>
    </div>
  </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import R2RModel from './component/R2RModel'
import CurrentR2RPara from './component/CurrentR2RPara'
import R2RPara from './component/R2RPara'
import R2RCondition from './component/R2RCondition'
import DcolFilter from './component/DcolFilter'
import RefenceSpec from './component/RefenceSpec'
import ProcessSpec from './component/ProcessSpec'
import BaseTabs from "@/component/BaseTabs"
import { getHasPrivTip, getFuncID,addValidate,searchValidata } from '@/commn/decoratorFn'
import { loadSearchColumns,searchFn,getTableHeight } from '@/commn/comTable'
import { isDisable } from '@/commn/commonFn'
const modeArr=[{name:'1',type:'CURR_R2R_PARA'},{name:'2',type:'R2R_PARA_SPEC'},{name:'3',type:'R2R_COND'},{name:'4',type:'DCOL_FILTER'},{name:'5',type:'REF_SPEC'},{name:'6',type:'PROC_SPEC_PHOTO'}]
export default {
  components: {
    BaseSearch,
    R2RModel,
    CurrentR2RPara,
    R2RPara,
    R2RCondition,
    DcolFilter,
    RefenceSpec,
    ProcessSpec,
    BaseTabs,
    BaseTitle
  },
  data() {
    return {
      searchForm:[],
      searchParams:{
        R2R_MODEL_NAME:modeArr[0].type,
      },
      FUNC_ID :"",
      GRID_ID :"R2R_MODEL",
      title:'',
      isCollapse: false,
      height:0,
      activeTab:'1',
      tabs:[
        {label:'v_r2rspec_current_para',name:'1'},
        {label:'v_r2rspec_r2r_para',name:'2'},
        {label:'v_r2rspec_r2r_condition',name:'3'},
        {label:'v_r2rspec_data_filter',name:'4'},
        {label:'v_r2rspec_ref_spec',name:'5'}
        // {label:'v_r2rspec_process_spec',name:'6'}
      ]
    }
  },
  async created() {
    this.loadData()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    //初始化
    @getFuncID('R2RSpec/R2RSpec')
    async loadData(){
      const jumpParams = sessionStorage.getItem("jumpParams") && JSON.parse(sessionStorage.getItem("jumpParams")) || null
      await loadSearchColumns.call(this)
      sessionStorage.removeItem("jumpParams")
      jumpParams && this.searchSubmit(jumpParams)
    },
    // 搜索的change事件
    async searchFn(data){
      searchFn.call(this,data)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    searchSubmit(data={},reloadSearchData=true,isUpdateSignalID){
      this.searchParams = {...this.searchParams,...data}
      this.initData(reloadSearchData,isUpdateSignalID)
    },
    // 初始化列表
    initData(reloadSearchData,isUpdateSignalID){
      this.searchParams.R2R_MODEL_NAME =  modeArr.find(v=>v.name === this.activeTab).type
      this.$refs.r2rModelSpec.initData(reloadSearchData,isUpdateSignalID) //切换tab时候  重新请求 r2r model spec
      const ref = this.getRef(this.activeTab)
      // R2R PARA SPEC的tab 每次点击时候  TableColumn重新请求接口
      ref.initData(reloadSearchData,isUpdateSignalID)
    },
    // 重置搜索条件
    resetSubmit(data){
      this.searchParams = {...this.searchParams,...data,R2R_MODEL_NAME:this.searchParams.R2R_MODEL_NAME}
      this.$refs.r2rModelSpec ? this.$refs.r2rModelSpec.resetInitData() : ''
      const ref = this.getRef(this.activeTab)
      ref ? ref.resetInitData() : ''
    },
    // 切换tab
    @getHasPrivTip('R')
    @addValidate()
    handleTab(item){
      this.activeTab = item
      this.$nextTick(()=>{
        // if(!getHasPriv(this.FUNC_ID,'R')){
        //   return
        // }
        this.searchSubmit()
      })
    },
    //获取tab对应的ref
    getRef(type){
      const typeArr = new Map([
        ['0','r2rModelSpec'],
        ['1','currentParaSpec'],
        ['2','r2rParaSpec'],
        ['3','r2rCond'],
        ['4','dataFilter'],
        ['5','refSpec'],
        ['6','processSpec']
      ])
      return typeArr.get(type) && this.$refs[typeArr.get(type)]
    },
    //准备新增
    @addValidate()
    toAdd(type,isAdd = true,reloadSearchData,isUpdateSignalID){ // isAdd true 表示新增  false 表示查询
      const ref = this.getRef(type)
      isAdd ? (type === '0' ? ref.copy() : ref.add()) : this.searchSubmit(this.searchParams,reloadSearchData,isUpdateSignalID)
    },
    //是否禁用搜索框
    disableSearch(bool){
      this.searchForm = isDisable(this.searchForm,bool)
    }
  },
  watch:{
    $route:{
      handler(to,from){
        if(to?.path === '/R2RSpec' && sessionStorage.getItem("jumpParams")){
          this.loadData()
        }
      },
      // 深度观察监听
      deep: true,
      immediate:true
    }
  }
}
</script>
<style lang="scss" scoped>
  /deep/ .el-tabs__content{
    overflow: visible;
  }
</style>
