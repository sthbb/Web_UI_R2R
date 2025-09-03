<template>
  <div>
    <div class="m-b-10">
      <BaseTitle :title="$t('c_formula_group')"/>
      <!-- <el-button @click="()=>{dialogIsCollapse = !dialogIsCollapse}" type="primary">{{dialogIsCollapse ?  $t("expand") : $t('collapse')}}</el-button> -->
    </div>
    <el-form ref="form" :model="historyData" inline v-if="!dialogIsCollapse" size="small">
      <el-form-item :label="$t('c_formula_group_name')" label-width="122px">
        <el-input
          v-model="historyData.FORMULA_GRP_NAME"
          :placeholder="$t('v_notice_input_formula_group_name')"
          disabled
        />
      </el-form-item>
      <el-form-item :label="$t('c_formula_group_type')" label-width="116px">
        <el-select
          v-model="historyData.FORMULA_GRP_TYPE"
          :placeholder="$t('v_notice_select_formula_group_type')"
          disabled
        >
          <el-option
            :label="$t(item.label)"
            :value="item.value"
            v-for="item in formulaGroupType"
            :key="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('c_eqp_area')">
        <el-input v-model="historyData.AREA_ID" disabled />
      </el-form-item>
      <el-form-item :label="$t('c_remark')">
        <el-input
          type="text"
          :placeholder="$t('v_notice_please_input_remark')"
          v-model="historyData.REMARK"
          disabled
        />
      </el-form-item>
    </el-form>
    <div class="history-contain">
      <div class="history">   <!-- history -->
        <div class="records"> <BaseTitle :title="$t('v_dialog_title_history_records')" /></div>
        <vxe-table
          align="center"
          v-bind="baseProps"
          :data="historyArr"
          :cell-class-name="({row})=>{return row.isClick ? 'font-bold cursor-pointer' : 'cursor-pointer'}"
          @cell-click="expandFormula"
          max-height="350"
        >
          <vxe-table-column 
            :field="item.COL_NAME" 
            :title="$t(item.LABEL_ID)" 
            v-for="item in historyColumns.columns" :key="item.COL_NAME"
            :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
            :align="item.TEXT_H_ALIGN || 'center'"
            header-align="center"
          />
        </vxe-table>
      </div>
      <div class="formula-list"> <!-- formula list -->
        <div class="m-b-18">
          <BaseTitle :title="$t('c_formula_list')"/>
        </div>
        <vxe-table
          align="center"
          v-bind="baseProps"
          :data="formulaExpList"
          :cell-class-name="({row})=>{return row.isClick ? 'font-bold cursor-pointer' : 'cursor-pointer'}"
          @cell-click="expandOperand"
          max-height="160"
        >
          <vxe-table-column 
            :field="item.COL_NAME" :title="$t(item.LABEL_ID)"  
            :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
            :align="item.TEXT_H_ALIGN || 'center'"
            header-align="center"
            v-for="item in historyColumns.formulaColumns" :key="item.COL_NAME" :width="item.width"
          />
        </vxe-table>
        <div class="oparand-box m-b-18">
          <div class="operand-item grid-box">  <!-- operand old -->
            <div class="m-b-18">
              <BaseTitle :title="$t('v_dialog_title_operand_old')"/>
            </div>
            <vxe-table
              align="center"
              v-bind="baseProps"
              :data="prevOperand"
              max-height="160"
            >
              <vxe-table-column 
                :field="item.COL_NAME" 
                :title="$t(item.LABEL_ID)" 
                v-for="item in historyColumns.oprdColumns" :key="item.COL_NAME" :width="item.width"
                :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
                :align="item.TEXT_H_ALIGN || 'center'"
                header-align="center"
              />
            </vxe-table>
          </div>
          <div class="operand-item grid-box">  <!-- operand new -->
            <div class="m-b-18">
              <BaseTitle :title="$t('v_dialog_title_operand_new')"/>
            </div>
            <vxe-table
              align="center"
              v-bind="baseProps"
              :data="currOperand"
              max-height="160"
            >
              <vxe-table-column 
                :field="item.COL_NAME" 
                :title="$t(item.LABEL_ID)" 
                :min-width="item.COL_WIDTH == 0  || item.COL_WIDTH === null ?  160 : item.COL_WIDTH"
                :align="item.TEXT_H_ALIGN || 'center'"
                header-align="center"
                v-for="item in historyColumns.oprdColumns" :key="item.COL_NAME" :width="item.width"
              />
            </vxe-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import BaseTitle from '@/component/BaseTitle'
export default {
  components:{BaseTitle},
  props: {
    historyColumns: {
      type: Object,
      default: () => {
        return {}
      },
    },
    historyList: {
      type: Array,
      default: () => {
        return []
      },
    },
    searchParams: {
      type: Object,
      default: () => {
        return {}
      },
    },
    historyData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    formulaGroupType: {
      type: Array,
      default: () => {
        return []
      }
    },
    formulaDetail: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      historyArr:[],
      formulaExpList: [],
      prevOperand: [],
      currOperand: [],
      dialogIsCollapse:false,
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
  created() {},
  computed: {},
  methods: {
    //选中算法
    expandFormula({row}) {
      const currentItem = this.historyArr.find(v=>v.isClick)
      if(currentItem.ID === row.ID){
        return
      }
      this.historyArr = this.historyArr.map(v=>{return{...v,isClick:v.ID === row.ID}})
      this.$emit('expandFormula',row)
    },
    //展开Operand
    expandOperand({row}) {
      this.formulaExpList = this.formulaExpList.map(v=>{return{...v,isClick:v.ID === row.ID}})
      this.prevOperand = this.isEmpty(row.PREV_OPRD)
        ? []
        : JSON.parse(row.PREV_OPRD) || []
      this.currOperand = this.isEmpty(row.CURR_OPRD)
        ? []
        : JSON.parse(row.CURR_OPRD) || []
    },
    isEmpty(string) {
      return !string || string && Object.keys(JSON.parse(string)).length === 0
    }
  },
  watch:{
    historyList:{
      immediate:true,
      deep:true,
      handler(newData){
        newData[0].isClick = newData.length > 0 ? true : false
        this.historyArr = newData
        this.dialogIsCollapse = false
      }
    },
    formulaDetail:{
      immediate:true,
      deep:true,
      handler(newData){
        this.formulaExpList = newData
        if(this.formulaExpList.length > 0){
          this.expandOperand({row:this.formulaExpList[0]})
        }else{
          this.prevOperand = []
          this.currOperand = []
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .vxe-table--body-wrapper{
  overflow-x: hidden !important;
}
.el-form-item{
  &:last-child{
    margin-bottom: 18px;
  }
}
.history-contain{
  display: flex;
  position: relative;
  .history{
    width: 260px;
    display: grid;
    grid-template-rows:31px auto;
    overflow-x: auto;
    .records{
      height: 21px;
    }
    .vxe-table{
      margin-top: 8px;
    }
  }
  .formula-list{
    flex: 1;
    margin-left: 18px;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .oparand-box{
      display: flex;
      margin-top:18px;
      .operand-item{
        flex: 1;
        margin-right: 10px;
        width: 100%;
        overflow-x: auto;
        &:last-child{
          margin-right: 0;
        }
      }
      .grid-box{
        display: grid;
        grid-template-rows:31px auto;
      }
    }
  }
}
</style>
