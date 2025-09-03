<template>
    <div>
      <vxe-table
        align="center"
        :cell-class-name="cellClassName"
        v-bind="baseProps"
        :data="tableData">
        <vxe-table-column type="seq" width="55" :title="$t('v_dialog_title_lots')"></vxe-table-column>
        <vxe-table-column :field="item.COL_NAME" :title="item.LABEL_ID" v-for="(item,index) in columns" :key="item.prop">
          <template v-slot:header>
            <span>{{ $t(item.LABEL_ID) }}</span>
            <span class="header-tip"> &nbsp; (%)</span>
          </template>
          <template v-slot="{ row,rowIndex }">
            <el-input
              v-model="row[item.COL_NAME]"
              :placeholder="$t('v_notice_placeholder_input') + $t(item.LABEL_ID)"
              type="number"
              :min="1"
              :max="100"
              :disabled="disabled"
              @change="changeValue"
              v-if="index < (rowIndex+1)"
            />
            <span v-else :style="{color:row[item.COL_NAME] === 100 ? '' : '#f56c6c'}">{{ row[item.COL_NAME] }}</span>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>
</template>
<script>

export default {
  props:{
    weight:{
      type:Object,
      default:()=>{return{index:0,data:[]}}
    },
    disabled:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      defaultValue:'',
      tableData:[],
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
        align: "center",
        ref: "xTable",
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
  async created(){
    this.defaultValue = await this.getWeightDefault()
  },
  computed:{
  columns(){
    return [
        {COL_NAME:'LOT1',LABEL_ID:this.$t('v_dialog_col_lot1')},
        {COL_NAME:'LOT2',LABEL_ID:this.$t('v_dialog_col_lot2')},
        {COL_NAME:'LOT3',LABEL_ID:this.$t('v_dialog_col_lot3')},
        {COL_NAME:'LOT4',LABEL_ID:this.$t('v_dialog_col_lot4')},
        {COL_NAME:'LOT5',LABEL_ID:this.$t('v_dialog_col_lot5')},
        {COL_NAME:'TOT',LABEL_ID:this.$t('v_dialog_col_tot')}
      ]
    },
   },
  methods:{
    // 单元格样式
    cellClassName({rowIndex, columnIndex}){
      return columnIndex !== this.columns.length && columnIndex > (rowIndex + 1) ? 'cell-disabled' : ''
    },
    // 值发生改变
    changeValue(){
      this.tableData = (this.tableData || []).map(element => {
        const total = +(element.LOT1 || 0) + (+(element.LOT2 || 0)) + (+(element.LOT3 || 0)) + (+(element.LOT4||0)) + (+(element.LOT5 || 0))
        return {...element,TOT:total || '' } 
      })
      this.$emit('finalyData',{type:0,result:this.tableData})
    },
    //weight值
    valid(){
      const weightArr = []
      this.tableData.forEach(v=>{
        const total = (v.LOT1 || 0)/100 + ';' + (v.LOT2 || 0)/100 + ';' + (v.LOT3 || 0)/100 + ';' + (v.LOT4 || 0)/100 + ';' + (v.LOT5 || 0)/100
        const valueString = total.split(";").filter(m=>m !=='0').join(';')
        valueString && weightArr.push(valueString)
      })
      return weightArr
    },
    // 保存
    save(){
      const result = this.valid().length === 0 ? '' : this.valid().join("|")
      this.$emit('finalyData',{type:2,result})
    },
    // 复制
    copy(){
      const result = this.valid().length === 0 ? '' : this.valid().join("|")
      this.$emit('finalyData',{type:1,result})
    },
    //一键清空
    empty(){
      this.tableData.forEach(v=>{
        for(let key in v){
          v[key] = key === '_X_ROW_KEY' ? v[key] : undefined
        }
      })
      this.$emit('finalyData',{type:3,result:this.valid().length === 0 ? '' : this.valid()})
    },
    // 重置为默认值
    async resetDefalut(){
      let resetData = []
      this.defaultValue.split("|").forEach(v=>{
        const obj = {}
        v.split(";").forEach((m,i)=>{
           obj[`LOT${i+1}`] = m ? m*100 : null
        })
        resetData.push(obj)
      })
      this.tableData = resetData
      this.changeValue()
    },
    // weight 默认值
    async getWeightDefault(){
      const { modelParaList } = this.$api.parameter
      const res = await modelParaList({ENUM_ID:'REF_WEIGHT'}, 'ENUMVAL_MANAGEMENT#select')
      return res.DATA && res.DATA.length > 0 && res.DATA[0].ENUM_VAL
    }
  },
  watch:{
    weight:{
      deep:true,
      immediate:true,
      handler(newData){
        this.tableData = newData.data
        this.changeValue()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .header-tip{
    color: #ccc;
    font-weight: 400;
  }
</style>
