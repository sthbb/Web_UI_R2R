<template>
  <div class="add-formula">
    <div class="formula-item">
      <span>{{ $t("c_formula_exp") }}</span>
      <el-input :placeholder="$t('v_notice_please_input_formula_exp')" clearable :class="formula.errorText ? 'error-color' : ''" v-model="formula.FORMULA_EXP"  @input="formulaChange" :disabled="Boolean(formula.FORMULA_KEY)"/>
      <div class="formula-error"> {{ formula.errorText }} </div>
    </div>
    <div class="formula-item">
      <span>{{ $t("c_remark") }}</span>
      <el-input type="textarea" :rows="2" :placeholder="$t('v_notice_please_input_remark')" v-model="formula.REMARK"/>
    </div> 
    <div class="formula-item" v-if="formula.formulaValues.length>0">
      <span>{{ $t("v_dialog_col_values") }}</span>
      <div class="formula-value-box">
        <div class="formula-value">
          <span class="formula-value-item">{{$t('c_operand')}}</span>
          <span class="formula-value-item">{{$t('c_value')}}</span>
        </div>
        <div v-for="item in formula.formulaValues" :key="item.id" class="formula-value">
          <span class="formula-value-item">{{item.label}}</span>
          <span class="formula-value-item">
            <el-input type="number" v-model="item.value" :min="1" :disabled="Boolean(formula.FORMULA_KEY)"/>
          </span>
        </div>
      </div>
    </div>
    <div class="formula-item">
      <span>{{ $t("c_formula_result") }}</span>
      <el-input :placeholder="$t('v_notice_input_formula_result')" clearable  disabled v-model="formula.result"/>
    </div>
  </div>
</template>
<script>
export default {
  props:{
    formula:{
      type:Object,
      default:()=>{return {formulaValues:[]}}
    }
  },
  data() {
    return {}
  },
  created() {
  },
  methods: {
    //计算表达式公式
    formulaChange(value){
      this.$emit('formulaEpx',value ? value.trim().toUpperCase() : '')
    }
  }
}
</script>
<style lang="scss" scoped>
.add-formula {
  .formula-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
    font-size: 12px;
    &:last-child{
      margin-bottom: 0;
    }
    > span {
      width: 110px;
      text-align: right;
      margin-right: 20px;
    }
    > div{
      flex: 1;
    }
    .formula-error {
      position: absolute;
      top: 30px;
      left: 130px;
      color: #f56c6c;
    }
    .formula-value-box{
      border-radius: 4px;
      border: 1px solid #DCDFE6;
      border-bottom: none;
      .formula-value{
        border-bottom: 1px solid #DCDFE6;
        border-bottom: 0;
        display: flex;
        .formula-value-item{
          width: 50%;
          border-right: 1px solid #DCDFE6;
          border-bottom: 1px solid #DCDFE6;
          text-align: center;
          height: 36px;
          line-height: 36px;
          padding: 0 10px;
          &:last-child{
            border-right: none;
          }
        }
      }
    }
  }
}

/deep/ .error-color.el-input .el-input__inner {
  border-color: #f56c6c;
}
/deep/ .vxe-input--extra-suffix, .vxe-input--prefix, .vxe-input--suffix{
  top: 8px;
}
</style>
