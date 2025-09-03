<template>
  <div class="add-formula-group">
    <!-- <div class="m-b-18 font-bold">
      <span class="m-r-10">{{ $t("c_formula_group") }}</span>
      <el-button @click="()=>{dialogIsCollapse = !dialogIsCollapse}" type="primary">{{dialogIsCollapse ?  $t("com_expand") : $t('com_collapse')}}</el-button>
    </div> -->
    <div class="m-b-10">
      <BaseTitle :title="$t('c_formula_group')" />
    </div>
    <el-form ref="form" :model="formulaGroup" inline v-if="!dialogIsCollapse" size="small">
      <el-form-item :label="$t('c_formula_group_name')" label-width="122px">
        <el-input v-model="formulaGroup.FORMULA_GRP_NAME" :placeholder="$t('v_notice_input_formula_group_name')" :disabled="type === 'see' || Boolean(formulaGroup.FORMULA_GRP_KEY)"/>
      </el-form-item>
      <el-form-item :label="$t('c_formula_group_type')" label-width="116px">
        <el-select v-model="formulaGroup.FORMULA_GRP_TYPE" :placeholder="$t('v_notice_select_formula_group_type')" :disabled="type === 'see' || Boolean(formulaGroup.FORMULA_GRP_KEY)">
          <el-option :label="$t(item.label)" :value="item.value" v-for="item in formulaGroupType" :key="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('c_eqp_area')">
        <el-input v-model="formulaGroup.AREA_ID" disabled />
      </el-form-item>
      <el-form-item :label="$t('c_remark')">
        <el-input type="text" :placeholder="$t('v_notice_please_input_remark')" v-model="formulaGroup.REMARK" :disabled="type === 'see' || Boolean(formulaGroup.FORMULA_GRP_KEY)"/>
      </el-form-item>
    </el-form>
    <div class="add-formula-contain">
      <div class="formula-list">
        <BaseTitle :title="$t('c_formula')" class="m-b-18"/>
        <vxe-table
          align="center"
          v-bind="baseProps"
          :data="tableData"
        >
          <vxe-table-column 
            :field="item.COL_NAME" 
            :title="$t(item.LABEL_ID)" 
            :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
            :align="item.TEXT_H_ALIGN || 'center'"
            header-align="center"
            v-for="item in columns.slice(1)" :key="item.COL_NAME">
            <template slot-scope="scope">
              <el-button
                @click=" () => { $emit('addFormula', scope.row)}"
                v-if="item.COL_NAME === 'ACTION_BAR'"
                type="text"
                >{{ $t("btn_add") }}</el-button
              >
              <span v-else>{{scope.row[item.COL_NAME]}}</span>
            </template>
          </vxe-table-column>  
        </vxe-table>
      </div>
      <div class="formula_arrow">
        <div class="trangle-right trangle" :style="{borderLeft:`20px solid ${$root.theme}`}"/>
      </div>
      <div class="formula-list">
        <BaseTitle :title="$t('c_formula_list')" class="m-b-18"/>
        <vxe-table
          align="center"
          v-bind="baseProps"
          :data="addFormula"
          ref="sortTable"
          row-key
          :cell-class-name="({row,column,rowIndex})=>{return cellClassName(row,column,rowIndex)}"
          @cell-click="({row,rowIndex})=>{toExpendOperand(rowIndex,row) }"
        >
          <vxe-table-column width="60">
            <template v-slot>
              <span class="drag-btn">
                <i class="vxe-icon--menu"></i>
              </span>
            </template>
          </vxe-table-column>
          <vxe-table-column 
            :field="item.COL_NAME" 
            :title="$t(item.LABEL_ID)" 
            :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
            :align="item.TEXT_H_ALIGN || 'center'"
            header-align="center"
            v-for="item in columns" :key="item.COL_NAME"
          >
            <template slot-scope="scope">
              <el-button
                v-if="item.COL_NAME === 'ACTION_BAR'"
                @click="(event) => { event.stopPropagation();$emit('delFormula', scope.row)}"
                type="text"
                :disabled="type === 'see'"
                >{{ $t("btn_delete") }}</el-button>
                <template v-if="item.COL_NAME === 'FORMULA_SEQ'">
                  {{scope.row[item.COL_NAME]}}<i :class="[opeIndex !== scope.rowIndex ? '' : 'el-icon-caret-bottom font-bold'] " />
                </template>
              <span v-else>{{scope.row[item.COL_NAME]}}</span>
            </template>
          </vxe-table-column> 
        </vxe-table>
      </div>
    </div>
    <div v-if="opeIndex !== undefined && addFormula.length > 0 && addFormula[opeIndex] && addFormula[opeIndex].OPERAND && addFormula[opeIndex].OPERAND.length > 0">
      <div class="m-b-18 m-t-20 operand-title font-bold" >
        <BaseTitle :title="$t('c_operand')" class="m-b-18"/>
        <div class="trangle-bottom trangle" :style="{borderTop:`20px solid ${$root.theme}`}"/> 
      </div>
      <vxe-table
        align="center"
        v-bind="baseProps"
        :data="addFormula[opeIndex].OPERAND"
        max-height="220"
        class="operand-table"
      >
        <vxe-table-column 
          :field="item.COL_NAME" 
          :title="$t(item.LABEL_ID)" 
          :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
          :align="item.TEXT_H_ALIGN || 'center'"
          header-align="center"
          v-for="item in operandColumn" :key="item.COL_NAME" 
        >
          <template slot-scope="scope">
            <el-input type="number" v-model="scope.row[scope.column.property]" :placeholder="$t('v_notice_placeholder_input')+ $t(item.LABEL_ID)" :disabled="type === 'see'" v-if="scope.column.property === 'ITEM' && scope.row.DATA_SRC === 'Const'" @input="()=>{operandHasChange()}"/>
            <el-input v-model="scope.row[scope.column.property]" :placeholder="$t('v_notice_placeholder_input') + $t(item.LABEL_ID)" disabled v-else-if="scope.column.property === 'OPRD_NAME'"/>
            <el-select v-model="scope.row[scope.column.property]" :placeholder="$t('v_notice_placeholder_select') + $t(item.LABEL_ID)" @change="(e)=>{selectChange(e,scope)}" :disabled="type === 'see'" v-else >
              <el-option
                v-for="child in getOptions(item,scope.row)"
                :key="child.value"
                :label="child.label"
                :value="child.value">
              </el-option>
            </el-select>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>
  </div>
</template>
<script>
import sortable from 'sortablejs'
import BaseTitle from '@/component/BaseTitle'
import {getColMap, resetParams, formatParam,formulaVariate } from '@/commn/commonFn'
export default {
  props: {
    formulaGroup: {
      type: Object,
      default: () => {
        return {}
      },
    },
    formulaGroupType: {
      type: Array,
      default: () => {
        return []
      },
    },
    tableData: {
      type: Array,
      default: () => {
        return []
      },
    },
    addTableData: {
      type: Array,
      default: () => {
        return []
      },
    },
    operandData:{
      type:Array,
      default:()=>{return []}
    },
    type:{
      type:String,
      default:'edit'
    },
    searchParams:{
      type:Object,
      default:()=>{return {}}
    },
    firstAddData:{
      type:Array,
      default:()=>{return []}
    }
  },
  components:{BaseTitle},
  data() {
    return {
      columns:[],
      operandColumn:[],
      showHelpTip1:false,
      addFormula:[],
      isOverFlow:false,
      dialogIsCollapse:false,
      opeIndex:undefined,
      dataSrcArr:[],
      baseProps: {
        border: true, //是否带有边框
        round: true, //是否带有圆角
        keepSource: true, //某一些操作 查看是否带有原始数据
        stripe: false, //是否展示斑马线
        showOverflow: true, //一行显示文本  超出显示省略号
        autoResize: true, //table自适应
        resizable: true, //所有的列是否允许拖动列宽调整大小
        highlightHoverRow: true, //鼠标移到行是否要高亮显示
        highlightCurrentRow: false, //是否要高亮当前行,
        maxHeight:'220px',
        align: "center",
        ref: "",
        id:'id',
        seqConfig: { //序号配置
          startIndex: 0,
        },
        tooltipConfig: { //tooltip 配置项
          enterable: true, // 鼠标是否可进入到 tooltip 中
          showAll: false, //所有单元格开启 tooltip 显示
        } 
      }
    }
  },
  created(){
    this.init()
    this.getDataSource()
    this.type !== 'see' && this.rowDrop()
  },
  methods: {
    async getColumns(GRID_ID){
      const columns =  await getColMap({
        FUNC_ID:this.FUNC_ID,
        GRID_ID,
        COL_HIDDEN_YN:'N'
      })
      return [...resetParams((columns || []),true)]
    },
    async init(){
      this.columns = await this.getColumns('FORMULA_GRP_POP_FORMULA_EXP')
      this.operandColumn = await this.getColumns('FORMULA_GRP_POP_OPRD')
    },
    //行样式
    cellClassName(row,column,rowIndex){
      const orignalClass = 'add-formula-item cursor-pointer '
      const addClass = row.opeType === 'add' ? 'bg-add' : (row.opeType === 'edit' ? 'edit-color' : '')
      const isSort = this.firstAddData.find(m=> row.opeType !== 'add' && m.FORMULA_KEY === row.FORMULA_KEY && m.FORMULA_SEQ !== row.FORMULA_SEQ) || {}
      const sortClass = Object.keys(isSort).length > 0 ? 'edit-color' : ''
      const expendClass = this.opeIndex === rowIndex ? 'expand-color' : ''
      return orignalClass + addClass + ' ' + (column.property === 'FORMULA_SEQ' ? sortClass + ' ' + expendClass : '') 
    },
    // 行拖动
    rowDrop() {
      this.$nextTick(() => {
        let xTable = this.$refs.sortTable
        this.sortable = sortable.create(xTable.$el.querySelector('.body--wrapper>.vxe-table--body tbody'), {
          handle: '.vxe-body--row',
          onEnd: (row) => {
            this.$emit('dragEnd',{sort:row,data:this.addFormula})
          }
        })
      })
    },
    //data sourece
    async getDataSource(){
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList({...this.searchParams,ENUM_ID:this.formulaGroup.FORMULA_GRP_TYPE === 'REWORK' ? 'OPRD_DATA_SRC_REWORK' : 'OPRD_DATA_SRC'},'ENUMVAL_MANAGEMENT#select')
      this.dataSrcArr = formatParam(res.DATA || []).map(v=>{return {...v,label:v.ENUM_VAL,value:v.ENUM_VAL}})
    },
    // data type
    async getDataType(params={},index){
      // 算法组类型是rework时  rework的数据跟Reference数据一致
      const { modelParaList } = this.$api.parameter
      let res  = await modelParaList({...this.searchParams,...params},'ENUMVAL_MANAGEMENT#select')
      res = formatParam(res.DATA || []).map(v=>{return {...v,label:v.ENUM_VAL,value:v.ENUM_VAL}})
      const newOperand = this.addFormula[this.opeIndex].OPERAND
      this.$set(newOperand,index,{...newOperand[index],dataTypeArr:res})
      this.$set(this.addFormula,this.opeIndex,{...this.addFormula[this.opeIndex],OPERAND:newOperand})

    },
    // data item
    async getItem(params,index){
      const { modelParaList } = this.$api.parameter
      let res  = await modelParaList({...this.searchParams,...params},'PARA_MANAGEMENT#selectParaByType')
      res = formatParam(res.DATA || []).map(v=>{return {...v,label:v.RECIPE_PARA,value:v.RECIPE_PARA}})
      const newOperand = this.addFormula[this.opeIndex].OPERAND
      this.$set(newOperand,index,{...newOperand[index],itemArr:res})
      this.$set(this.addFormula,this.opeIndex,{...this.addFormula[this.opeIndex],OPERAND:newOperand})
    },
    // 下拉框筛选
    async selectChange(e,item){
      const ENUM_ID = this.findEnumId(e)
      const newOperand = this.addFormula[this.opeIndex].OPERAND
      if(item.column.property === 'DATA_SRC'){
        this.$set(newOperand,item.rowIndex,{...newOperand[item.rowIndex],DATA_SRC:e,DATA_TYPE:null,ITEM:null,itemArr:[]})
        this.$set(this.addFormula,this.opeIndex,{...this.addFormula[this.opeIndex],OPERAND:newOperand})
        this.getDataType({ENUM_ID,DATA_SRC:e},item.rowIndex)
      }else if(item.column.property === 'DATA_TYPE'){
        if(item.row.DATA_SRC === 'R2R Model' && e === 'R2R_TARGET'){//特殊参数处理
          const res = [{label:'R2R_TARGET',value:'R2R_TARGET'}]
          this.$set(newOperand,item.rowIndex,{...newOperand[item.rowIndex],ITEM:'R2R_TARGET',itemArr:res})
          this.$set(this.addFormula,this.opeIndex,{...this.addFormula[this.opeIndex],OPERAND:newOperand})
          this.operandHasChange()
          return
        }
        this.$set(newOperand,item.rowIndex,{...newOperand[item.rowIndex],ITEM:null})
        this.$set(this.addFormula,this.opeIndex,{...this.addFormula[this.opeIndex],OPERAND:newOperand})
        this.getItem(item.row.DATA_SRC === 'R2R Model' && e === 'REF_TARGET' ? {PARA_TYPE:'REF_ALIAS'} : {PARA_TYPE:e},item.rowIndex)
      }
      this.operandHasChange()
    },
    // path item 
    async getPathItem(){
      this.load({...this.searchParam,PARA_TYPE:''},'PARA_MANAGEMENT#selectParaByType')
    },
    findEnumId(data){
     return ['Reference','Current'].includes(data) ? 'OPRD_TYPE_COMMON' : (data === 'Rework' ? 'OPRD_TYPE_REWORK' : (data === 'R2R Model' ? 'OPRD_TYPE_R2R_MODEL' : 'OPRD_TYPE_CONST'))
    },
    //options数据回显
    findAllOptions(){
      this.addFormula.forEach(async (m,index)=>{
        if(index === this.opeIndex){
          const operandData = m.OPERAND
          operandData.forEach(async(v,i)=>{
            v.DATA_SRC && this.getDataType({ENUM_ID:this.findEnumId(v.DATA_SRC),DATA_SRC:v.DATA_SRC},i)
            if(v.DATA_SRC === 'R2R Model' && v.DATA_TYPE === 'R2R_TARGET'){//特殊参数处理
              const res = [{label:'R2R_TARGET',value:'R2R_TARGET'}]
              this.$set(v,'itemArr',res)
              this.$set(v,'ITEM','R2R_TARGET')
              return
            }
            v.DATA_TYPE && this.getItem(v.DATA_SRC === 'R2R Model' && v.DATA_TYPE === 'REF_TARGET' ? {PARA_TYPE:'REF_ALIAS'} : {PARA_TYPE:v.DATA_TYPE},i)
          })
        }
      })
    },
    // 展开算法
    toExpendOperand(index){
      if(this.opeIndex === index){ //防止重复加载数据
        return
      }
      this.opeIndex = index
      const defaultParams = this.operandColumn.map(v=>v.COL_NAME)
      if(!this.addFormula[index].OPERAND || this.addFormula[index].OPERAND.length === 0){
        const OPERAND = formulaVariate(this.addFormula[index].FORMULA_EXP).map(v=>{return{OPRD_NAME:v,...defaultParams}})
        this.$set(this.addFormula,index,{...this.addFormula[index],OPERAND})
      }
      this.findAllOptions()
    },
    // Operand 是否改变
    operandHasChange(){
      const OPERAND = this.firstAddData.find(m=>m.FORMULA_KEY === this.addFormula[this.opeIndex].FORMULA_KEY)?.OPERAND || []
      let isChanged = false
      const keys = this.operandColumn.map(v=>v.COL_NAME)
      this.addFormula[this.opeIndex].OPERAND.forEach((newItem)=>{//判断新旧值有没有变更
        OPERAND.forEach((oldItem)=>{
          if(newItem.ID === oldItem.ID){
            keys.forEach(key=>{
              if(newItem[key] !== oldItem[key]){
                isChanged = true
              }
            })
          }
        })
      })
      this.addFormula[this.opeIndex].opeType !== 'add' && this.$set(this.addFormula,this.opeIndex,{...this.addFormula[this.opeIndex],opeType:isChanged ? 'edit' : ''})
    }
  },
  computed: {
    getOptions(){
      return function(item,row){
        return item.COL_NAME === 'DATA_SRC' ? this.dataSrcArr : (item.COL_NAME === 'DATA_TYPE' ? row.dataTypeArr : row.itemArr)
      }
    }
  },
  mounted(){},
  watch:{
    addTableData:{
      immediate:true,
      deep:true,
      handler(newData){
        this.addFormula = newData
      }
    },
    firstAddData:{
      immediate:true,
      deep:true,
      handler(){
        this.dialogIsCollapse = false
      }
    },
    'formulaGroup.FORMULA_GRP_TYPE':{
      immediate:true,
      deep:true,
      handler(newData,oldData){
        const isNeedEmptyData = (newData === 'REWORK' && oldData !== 'REWORK') || (newData !== 'REWORK' && oldData === 'REWORK')
        if(isNeedEmptyData && this.opeIndex !== undefined && this.addFormula[this.opeIndex].OPERAND){
          const newOperand = this.addFormula[this.opeIndex].OPERAND
          newOperand.forEach((v,i)=>{
            v.DATA_SRC = null
            v.DATA_TYPE = null
            v.ITEM = null
            v.dataTypeArr = []
            v.itemArr = []
            this.$set(newOperand,i,{...v})
          })
        }
        newData && this.getDataSource()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  /deep/ .vxe-input{
    width: 100%;
  }
  .el-form-item{
    &:last-child{
      margin-bottom: 18px;
    }
  }
  .add-formula-group {
    .add-formula-contain {
      display: flex;
      position: relative;
      // overflow-x: auto;
      width: 100%;
      overflow: hidden;
      .arror{
        position: absolute;
        top: -20px;
        left: 50%;
        -webkit-transform: translateX(-50%);
        transform: translateX(-50%);
        font-size: 20px;
        font-weight: bold;
        color: #000;
        cursor: pointer;
      }
      .formula-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: calc((100% - 32px)/2);
        overflow: hidden;
        .drag-btn{
          color: #999;
        }
      }
      .formula_arrow {
        padding: 0 6px;
        align-self: center;
        margin-top: 34px;
        .trangle {
            width: 0;
            height: 0;
        }
        .trangle-right {
          border-left: 20px solid #00678e;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
        }
      }
    }
    .operand-title{
      position: relative;
      .trangle-bottom{
        border-top: 20px solid #00678e;
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
        width: 0;
        height: 0;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
      }
    }
  }
  .operand-table{
    .vxe-input,.el-select{
      width: 100%;
    }
  }
</style>
