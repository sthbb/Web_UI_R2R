<template>
  <div>
    <Toolbar :columns="baseProps.columns" :toolbarConfig="baseProps.toolbarConfig" v-if="getShow" @exportExcel="exportExcel" @columnsSettins="columnsSettins" @buttonClick="buttonClick" @handlePageChange="(data)=>{$emit('handleTableChange',{type:'page',data})}" />
    <vxe-table
      v-bind="baseProps"
      :row-class-name="rowClassName"
      @toggle-row-expand="({rowIndex,expanded})=>{expanded && $emit('handleTableChange',{type:'expand',data:rowIndex})}"
      :scroll-y="{enabled: false}"
      :merge-cells="mergeCells"
      :data="baseProps.data"
    >
      <vxe-table-column type="expand" width="40" v-if="baseProps.isExpand">
        <template v-slot:content="{ }">
          <ExpendChild :expandData="baseProps.expandData" :expandColumn="baseProps.expandColumn" />
        </template>
      </vxe-table-column>
      <vxe-table-column
        v-for="item in filterColumns"
        :key="item.COL_NAME"
        :field="item.COL_NAME"
        :title="$t(item.LABEL_ID)"
        :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
        :width="item.COL_NAME === 'CHECK_ALL' ? 40 : item.width || 0"
        :fixed="item.COL_NAME === 'ACTION_BAR' ? 'right' : item.fixed"
        :align="item.TEXT_H_ALIGN || 'center'"
        header-align="center"
        :show-overflow="item.COL_NAME === 'CHECK_ALL' ? false : true"
      >
        <template v-slot:header>
          <template v-if="item.COL_NAME === 'CHECK_ALL'">
            <el-checkbox @change="(e)=>{$emit('handleTableChange',{type:'checkbox',data:{checked:e}})}" v-model="getAllCheck" :indeterminate="getCheck" :disabled="getDisabled"></el-checkbox>
          </template>
          <i class="vxe-cell--required-icon" v-if="item.MANDATORY_YN === 'y'"></i>
          <span v-if="item.COL_NAME !== 'CHECK_ALL'">{{ $t(item.LABEL_ID) }}</span>
          <span class="vxe-cell--sort" v-if="item.SORT_YN === 'y'">
            <i :class="['com-sort', baseProps.sortConfig.iconAsc || 'vxe-icon--caret-top', 'vxe-sort--asc-btn']" :style="{color:item.COL_NAME === sortObj.COL_NAME && sortObj.sortBy === 'asc' ? $root.theme : '#c0c4cc'}" @click="()=>{toSort(item.COL_NAME,'asc')}" />
            <i :class="['com-sort', baseProps.sortConfig.iconDesc || 'vxe-icon--caret-bottom', 'vxe-sort--desc-btn']" :style="{color:item.COL_NAME === sortObj.COL_NAME && sortObj.sortBy === 'desc' ?  $root.theme : '#c0c4cc'}" @click="toSort(item.COL_NAME,'desc')"/>
          </span>
          <el-popover
            v-if="item.TOOLTIP_TEXT"
            placement="right"
            trigger="hover"
            :content="$t(item.TOOLTIP_TEXT)">
            <i class="el-icon-warning-outline" slot="reference" />
          </el-popover>
        </template>
        <template v-slot="{ row, rowIndex }">
          <span v-if="item.COL_NAME === 'CHECK_ALL'">
            <el-checkbox v-model="row.checked" :checked="row.checked" :disabled="row.disabled" @change="(e)=>{$emit('handleTableChange',{type:'checkbox',data:{checked:e,rowIndex}})}"/>
          </span>
          <!-- 新的代码 -->
          <span v-if="getShowType(item,row,'text',showRenderType)">{{ row[item.COL_NAME] }}</span> 
          <Input :item="item" :row="row" v-if="getShowType(item,row,'input',showRenderType)" />
          <Number :item="item" :row="row" v-if="getShowType(item,row,'number',showRenderType)" @change="(e)=>{$set(baseProps.data,rowIndex,{...row,[item.COL_NAME]:e})}"/>
          <Cascader :item="item" :row="row" v-if="getShowType(item,row,'cascader',showRenderType)" />
          <Textarea :item="item" :row="row" v-if="getShowType(item,row,'textarea',showRenderType)" />
          <R2RSwitch :item="item" :row="row" v-if="getShowType(item,row,'switch',showRenderType)" />
          <Icon :item="item" :row="row" v-if="getShowType(item,row,'icon',showRenderType)" />
          <Select :item="item" :row="row" v-if="getShowType(item,row,'combobox',showRenderType)"  @change="(e)=>{$emit('handleTableChange',{type:'selectChange',data:{rowIndex,name:item.COL_NAME,value:e}})}"/>
          <action-bar :item="item" :row="row" :actions="baseProps.actions" @click="(data)=>{toButton(data.code,data.title,rowIndex)}" v-if="item.COL_NAME === 'ACTION_BAR'" />
          <template v-if="!viewHistory && item.COL_TYPE && item.COL_TYPE.buttons && ((row.tableType && item.COL_TYPE.buttons.opeicon)  || (row[item.COL_NAME] && item.COL_TYPE.buttons.dispicon))">
            <el-button
              class="m-l-8"
              :icon="!row.tableType ? item.COL_TYPE.buttons.dispicon.icon : item.COL_TYPE.buttons.opeicon.icon"
              :title="!row.tableType ? $t(item.COL_TYPE.buttons.dispicon.title) : $t(item.COL_TYPE.buttons.opeicon.title)"
              round
              @click="$emit('handleTableChange', { type: 'cell',data:{rowIndex,name:item.COL_NAME}})"
            />
          </template>
        </template>
      </vxe-table-column>
    </vxe-table>
    <div :style="{textAlign:baseProps.pagerConfig.align}" class="m-t-10" v-if="baseProps.pagerConfig.PAGINATION">
      <el-pagination
        @size-change="(e)=>{$emit('handleTableChange', {type: 'page', data:{PAGE_SIZE:  e,PAGE_NUM:1}})}"
        @current-change="(e)=>{$emit('handleTableChange', {type: 'page', data:{PAGE_NUM:e}})}"
        :current-page="baseProps.pagerConfig.PAGE_NUM"
        :page-sizes="baseProps.pagerConfig.pageSizes"
        :page-size="baseProps.pagerConfig.PAGE_SIZE"
        :layout="baseProps.pagerConfig.layout"
        :total="baseProps.pagerConfig.TOTAL || 0" />
    </div>
  </div>
</template>
<script>
import IconPicker from './IconPicker/IconPicker'
import ColumnSetting from './ColumnSetting'
import Input from './ComponentLibrary/Input'
import Number from './ComponentLibrary/Number'
import Cascader from './ComponentLibrary/Cascader'
import Textarea from './ComponentLibrary/Textarea'
import R2RSwitch from './ComponentLibrary/R2RSwitch'
import Icon from './ComponentLibrary/Icon'
import Select from './ComponentLibrary/Select'
import ActionBar from './ComponentLibrary/ActionBar'
import Toolbar from './ComponentLibrary/Toolbar'
import ExpendChild from './ComponentLibrary/ExpendChild'
import { getShowType } from '@/commn/commonFn'
import baseTableProps from '@/commn/baseProps'
export default {
  components: { IconPicker ,ColumnSetting,Input,Number,Textarea,Cascader,R2RSwitch,Icon,Select,ActionBar,Toolbar,ExpendChild},
  props: {
    tableOptions: {
      type: Object,
      default: () => {
        return {}
      }
    },
    viewHistory:{
      type:Boolean,
      default:false
    },
    showRenderType:{
      type:Boolean,
      default:false
    },
    mergeCells:{
      type:Array,
      default:()=>{
        return []
      }
    }
  },
  data() {
    return {
      getShowType,
      baseProps: {
        columns: [],//表头
        data: [],//数据
        ...baseTableProps
      },
      sortObj:{}
    }
  },
  computed: {
    // 是否全选
    getAllCheck:{
      get(){
        const checkedAll = this.baseProps.data.filter(v=>v.checked)
        return checkedAll.length > 0 && checkedAll.length === this.baseProps.data.length
      },
      set(){}
    },
    //是否选中
    getCheck(){
      const checkedAll = this.baseProps.data.filter(v=>v.checked)
      return checkedAll.length > 0 &&  checkedAll.length < this.baseProps.data.length
    },
    // 是否禁用
    getDisabled(){
      const disabledAll = this.baseProps.data.filter(v=>v.disabled)
      return disabledAll.length === this.baseProps.data.length
    },
    // tabbar是否显示
    getShow(){
      let isShow = false
      for(let key in this.baseProps.toolbarConfig){
        if(key !== 'buttons' && this.baseProps.toolbarConfig[key] || (key === 'buttons' && this.baseProps.toolbarConfig[key].length > 0)){
          isShow = true
          break
        }
      }
      return isShow
    },
    // table columns 筛选
    filterColumns(){
      return this.baseProps.columns.filter(v=>v.visible || v.visible === undefined)
    }
  },
  watch:{
    tableOptions:{
      deep:true,
      immediate: true,
      handler(newParam){
        this.baseProps =Object.assign({},this.deepAssign(this.baseProps,newParam))
        this.data = [...this.baseProps.data]
      }
    }
  },
  methods: {
    // 导出
    exportExcel(){
      this.$refs[this.baseProps.ref].exportData({
        filename: this.$t(this.baseProps.exportTitle) || '',
        sheetName: 'sheet1',
        type:'xlsx',
        data: this.baseProps.data,
        columnFilterMethod:({column})=>{
          return column.property !== 'ACTION_BAR' && column.property !== 'CHECK_ALL'
        }
      })
    },
    //列设置
    columnsSettins(columns){
      this.baseProps.columns = this.baseProps.columns.map(v=>{return {...v,visible:columns.includes(v.COL_NAME)}})
    },
    // button click
    async buttonClick({ code }) {
      const typeArr = new Map([
        ["add",() => {this.$emit("handleTableChange", { type: 'add' })}],
        ["save",() => {this.$emit("handleTableChange", { type: 'save'})}],
        ["delete",() => {this.$emit("handleTableChange", { type: 'delete'})}],
        ["copy",() => {this.$emit("handleTableChange", { type: 'copy'})}],
        ["cancel",() => {this.$emit("handleTableChange", { type: 'reset'})}],
      ])
      return typeArr.get(code) && typeArr.get(code)()
    },
    //actions操作
    toButton(code,title,index){
      const typeArr = new Map([
        ["edit",() => {this.$emit("handleTableChange", { type: 'edit',data:index })}],
        ["save",() => {this.$emit("handleTableChange", { type: 'save',data:index})}],
        ["cancel",() => {this.$emit("handleTableChange", { type: 'cancel',data:index})}],
        ["del",() => {this.$emit("handleTableChange", { type: 'delete',data:index})}],
        ["history",() => {this.$emit("handleTableChange", { type: 'history',data:index})}],
        ["detail",() => {this.$emit("handleTableChange", { type: 'detail',data:{rowIndex:index,name:title ? title.toUpperCase() : ''}})}],
        ["password",() => {this.$emit("handleTableChange", { type: 'password',data:index})}],
        ["resetpassword",() => {this.$emit("handleTableChange", { type: 'resetpassword',data:index})}],
        ["jumpusermenu",() => {this.$emit("handleTableChange", { type: 'jumpusermenu',data:index})}],
        ["jumpmenu",() => {this.$emit("handleTableChange", { type: 'jumpmenu',data:index})}],
        ["jumpuser",() => {this.$emit("handleTableChange", { type: 'jumpuser',data:index})}],
        ["jumpmodelspec",() => {this.$emit("handleTableChange", { type: 'jumpmodelspec',data:index})}],
      ])
      return typeArr.get(code) && typeArr.get(code)()
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
    },
    //默认  新增  编辑颜色区分
    rowClassName({ row }) {
      return row?.tableType === "add" ? "bg-add" : (row?.tableType === "edit" ? "bg-edit" : "")
    },
    // 排序
    toSort(COL_NAME,sortBy){
      this.sortObj = {
        COL_NAME,
        sortBy
      }
      this.baseProps.data = this.$ueutils.orderBy(this.baseProps.data,[[COL_NAME, sortBy]])
      this.$emit("handleTableChange", { type: 'sort',data:this.baseProps.data})
    },
    //记录排序状态
    initSort(){
      Object.keys(this.sortObj).length > 0 && this.toSort(this.sortObj.COL_NAME,this.sortObj.sortBy)
    },
    // 清楚排序状态
    clearSort(){
      this.sortObj = {}
    }
  }
}
</script>
<style lang="scss" scoped>
.el-icon-warning-outline{
  font-size: 15px;
  margin-left: 4px;
  vertical-align: middle;
}
/deep/ .vxe-table {
  .vxe-sort--asc-btn{
    top: 0 !important;
  }
  .vxe-sort--desc-btn{
    bottom:0 !important;
  }
  .vxe-body--row {
    &.bg-add {
      background: #d3d3d3;
    }
    &.bg-edit {
      background: #f1f1f1;
    }
    .vxe-textarea--inner {
      line-height: 1.2;
    }
    .el-input{
      width: 90% !important;
    }
  }
}
</style>
