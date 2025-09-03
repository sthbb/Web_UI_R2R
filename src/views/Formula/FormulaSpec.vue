<template>
  <div class="device-parameter-contain">
    <div class="common-search-contain" v-if="searchForm.length > 0">
      <div :class="['el-menu',isCollapse ? 'el-menu--collapse' : '']" >
        <template>
          <BaseTitle :title="$t('com_search_condition')" class="search-title"/>
          <BaseSearch :data="searchForm" :params="searchParams" @emitChild="(data)=>{searchFn.call(this,data)}" @submit="searchSubmit" @reset="resetSubmit" ref="searchRef" labelWidth="124px"/>
        </template>
      </div>
      <span class="arror" @click="isCollapse = !isCollapse" :style="{background:$root.theme}">
        <i :class="!isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
      </span>
    </div>
    <div class="device-parameter" :style="{marginLeft:isCollapse ? '-10px':0}">
      <BaseTitle :title="$t('c_formula_group')" class="m-b-10"/>
      <FormulaGroup class="m-t-10 m-b-10" :searchParams="searchParams" :searchForm="searchForm" ref="FormulaGroup" @emitAdd="toAdd" @initData="(data)=>{toAdd(0,false,data.reloadSearchData,data.reladFormula)}" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" :title="title" v-if="FUNC_ID" />
      <BaseTitle :title="$t('c_formula')"/>
      <FormulaSpec class="m-t-10" :searchParams="searchParams" :searchForm="searchForm" ref="formulaSpec" @emitAdd="toAdd"  @initData="(data)=>{toAdd(1,false,data)}" @disableSearch="disableSearch" :height="height" :FUNC_ID="FUNC_ID" :title="title" v-if="FUNC_ID"/>
    </div>
  </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import FormulaGroup from './component/FormulaGroup'
import FormulaSpec from './component/FormulaSpec'
import { getHasPrivTip,getFuncID,addValidate,searchValidata } from '@/commn/decoratorFn'
import { loadSearchColumns,searchFn,getTableHeight } from '@/commn/comTable'
import { isDisable } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    FormulaGroup,
    FormulaSpec,
    BaseTitle
  },
  data() {
    return {
      searchFn,
      isCollapse:false,
      searchForm:[],
      searchParams:{},
      FUNC_ID:'',
      GRID_ID:'FORMULA',
      title:'',
      height:0
    }
  },
  created(){
    this.init()
  },
  mounted(){
    getTableHeight.call(this,'','formula')
  },
  methods: {
    @getFuncID('Formula/FormulaSpec')
    init(){
      loadSearchColumns.call(this)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    searchSubmit(data={},type,reloadSearchData=true,reladFormula=false){
      this.searchParams = {...this.searchParams,...data}
      const formulaGroupSearch = type === undefined || type === 0
      const formulaSearch = type === undefined || type === 1 || reladFormula
      formulaGroupSearch && this.$refs.FormulaGroup && this.$refs.FormulaGroup.initData(reloadSearchData)
      formulaSearch && this.$refs.formulaSpec && this.$refs.formulaSpec.initData(reloadSearchData)
    },
    // 重置搜索条件
    resetSubmit(data){
      this.searchParams = {...this.searchParams,...data}
      this.$refs.FormulaGroup ? this.$refs.FormulaGroup.resetInitData() : ''
      this.$refs.formulaSpec ? this.$refs.formulaSpec.resetInitData() : ''
    },
    //准备新增
    @addValidate()
    toAdd(type,isAdd= true,reloadSearchData,reladFormula=false){
      const ref = type === 0 ? this.$refs.FormulaGroup : this.$refs.formulaSpec
      isAdd ? ref.toEdit() : this.searchSubmit(undefined,type,reloadSearchData,reladFormula)
    },
    //是否禁用搜索框
    disableSearch(bool){
      this.searchForm = isDisable(this.searchForm,bool)
    }
  }
}
</script>
<style lang="scss" scoped>
.el-menu{
  width: 316px;
}
.el-menu--collapse.el-menu{
  width: 0;
}
</style>
