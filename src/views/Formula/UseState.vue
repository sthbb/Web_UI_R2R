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
      <div class="m-b-10">
        <UseState :searchParams="searchParams" :searchForm="searchForm" ref="useState" @disableSearch="disableSearch" :height="height" @initData="(data)=>{toSearch(data)}" :FUNC_ID="FUNC_ID" :title="title" v-if="FUNC_ID" />
      </div>
    </div>
  </div>
</template>
<script>
import BaseSearch from "@/component/BaseSearch"
import BaseTitle from "@/component/BaseTitle"
import UseState from './component/UseState'
import { getHasPrivTip,getFuncID,addValidate,searchValidata } from '@/commn/decoratorFn'
import { loadSearchColumns,searchFn,getTableHeight } from '@/commn/comTable'
import { isDisable } from '@/commn/commonFn'
export default {
  components: {
    BaseSearch,
    UseState,
    BaseTitle
  },
  data() {
    return {
      searchFn,
      isCollapse:false,
      searchForm:[],
      searchParams:{},
      FUNC_ID:'',
      GRID_ID:'USE_STATE',
      height:0,
      title:''
    }
  },
  created() {
    this.init()
  },
  mounted(){
    getTableHeight.call(this)
  },
  methods: {
    @getFuncID('Formula/UseState')
    async init(){
      await loadSearchColumns.call(this)
    },
    // 重置搜索条件
    resetSubmit(data){
      this.searchParams = {...this.searchParams,...data}
      this.$refs.useState ? this.$refs.useState.resetInitData()  : ''
    },
    //准备搜索
    @addValidate()
    toSearch(reloadSearchData){
      this.searchSubmit(undefined,reloadSearchData)
    },
    //搜索
    @getHasPrivTip('R')
    @searchValidata()
    searchSubmit(data={},reloadSearchData=true){
      this.searchParams = {...this.searchParams,...data}
      this.$refs.useState && this.$refs.useState.initData(reloadSearchData)
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
