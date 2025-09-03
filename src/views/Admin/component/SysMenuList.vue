<template>
  <div>
    <Toolbar :columns="baseProps.columns" :onlyMenu="true" :toolbarConfig="baseProps.toolbarConfig" @buttonClick="(item)=>{toButton(item.code === 'cancel' ? 'reset' : item.code)}" @handlePageChange="toButton('page')" />
    <vxe-table
      v-bind="baseProps"
      :tree-config="{children: 'children',accordion:true}"
    >
      <vxe-table-column
        v-for="(item, index) in filterColumns"
        :key="item.COL_NAME"
        :field="item.COL_NAME"
        :title="$t(item.LABEL_ID)"
        :tree-node="index === 0"
        :min-width="item.COL_WIDTH == 0 || item.COL_WIDTH === null ? 100 : item.COL_WIDTH"
        :width="item.width || 0"
        :fixed="item.COL_NAME === 'ACTION_BAR' ? 'right' : item.fixed"
        :align="item.TEXT_H_ALIGN || 'center'"
      >
        <template v-slot="{ row }">
          <span v-if="getShowType(item,row,'text')">{{ row[item.COL_NAME] }}</span> 
          <Input :item="item" :row="row" v-if="getShowType(item,row,'input')" />
          <Number :item="item" :row="row" v-if="getShowType(item,row,'number')"/>
          <Cascader :item="item" :row="row" v-if="getShowType(item,row,'cascader')" />
          <Textarea :item="item" :row="row" v-if="getShowType(item,row,'textarea')" />
          <R2RSwitch :item="item" :row="row" v-if="getShowType(item,row,'switch')" />
          <Icon :item="item" :row="row" v-if="getShowType(item,row,'icon')" />
          <Select :item="item" :row="row" v-if="getShowType(item,row,'combobox')" />
          <action-bar :item="item" :row="row" :actions="filterAction(row)" @click="(data)=>{toButton(data.code,row)}" v-if="item.COL_NAME === 'ACTION_BAR'" />
          <template v-if="item.COL_TYPE && item.COL_TYPE.buttons">
            <el-button
              class="m-l-8"
              v-bind="item.COL_TYPE.props || {}"
              :icon="!row.tableType ? item.COL_TYPE.buttons.dispicon.icon : item.COL_TYPE.buttons.opeicon.icon"
              :title="!row.tableType ? item.COL_TYPE.buttons.dispicon.title : item.COL_TYPE.buttons.opeicon.title"
              round
              @click="cellClick(rowIndex,item)"
            />
          </template>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>
<script>
import Toolbar from '@/component/ComponentLibrary/Toolbar'
import Input from '@/component/ComponentLibrary/Input'
import Number from '@/component/ComponentLibrary/Number'
import Cascader from '@/component/ComponentLibrary/Cascader'
import Textarea from '@/component/ComponentLibrary/Textarea'
import R2RSwitch from '@/component/ComponentLibrary/R2RSwitch'
import Icon from '@/component/ComponentLibrary/Icon'
import Select from '@/component/ComponentLibrary/Select'
import ActionBar from '@/component/ComponentLibrary/ActionBar'
import baseTableProps from '@/commn/baseProps'
import { getShowType } from '@/commn/commonFn'
export default {
  components: { Toolbar,Input,Number,Cascader,Textarea,R2RSwitch,Icon,Select,ActionBar},
  props: {
    tableOptions: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      getShowType,
      baseProps: {
        columns: [],//表头
        data: [],//数据
        ...baseTableProps
      },
      treeExpandRecords:[],
    }
  },
  computed: {
    filterColumns(){
      return this.baseProps.columns.filter(v=>v.visible || v.visible === undefined)
    }
  },
  methods: {
    //展开
    expend(index){
      // let expandData = this.treeExpandRecords.reduce((prev,v)=>{
      //   const findIndex = this.baseProps.data.findIndex(m=>m.MENU_ID === v.MENU_ID)
      //   prev.push(this.baseProps.data[findIndex])
      //   return prev
      // },[index === undefined ? '' : this.baseProps.data[index]])
      const expandData = this.baseProps.data[index]
      this.$refs[this.baseProps.ref].setTreeExpand(expandData, true)
    },
    filterAction(row){
      return row.tableType === 'edit' || row.hasChild  ? [] : (row.UPPER_MENU_ID === '0' ? this.baseProps.actions : this.baseProps.actions.filter(v=>v.code !== 'addmenu'))
    },
    toButton(type,row){
      if(type === 'edit'){
        this.treeExpandRecords = this.$refs[this.baseProps.ref].getTreeExpandRecords()
      }
      this.$emit('handleTableChange',{type,data:row})
    },
    // 对象深度合并
    deepAssign(oldObj={},newObj={}){
      for(let key in newObj){
        if (typeof newObj[key] === 'object' && newObj[key]) {
          oldObj[key] = Object.prototype.toString.call(newObj[key]) === '[object Object]' ? {...oldObj[key],...newObj[key]} : newObj[key]
        }else{
          oldObj[key] = newObj[key]
        }
      }
      return oldObj
    }
  },
  watch:{
    tableOptions:{
      deep:true,
      immediate: true,
      handler(newParam){
        this.baseProps =Object.assign({},this.deepAssign(this.baseProps,newParam))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .el-select{
  width: 100%;
}
</style>
