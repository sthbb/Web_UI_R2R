<template>
  <div>
    <el-form
      :model="paramsForm"
      :ref="searchRef"
      :labelWidth="labelWidth"
      size="small"
      :inline="inline"
    >
      <el-form-item
        v-for="v in formData"
        :key="v.LABEL_ID"
        :label="$t(v.LABEL_ID)"
        :prop="v.COL_NAME"
        :class="v.COL_NAME ? '' : 'model-box'"
        :rules="getRule(v)"
      >
        <el-input
          v-if="(v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.name === 'input' || (!v.SEARCH_RENDER_TYPE || !v.SEARCH_RENDER_TYPE.name))"
          v-model.trim="paramsForm[v.COL_NAME]"
          v-bind="v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.props"
          :type=" (v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.attrs && v.SEARCH_RENDER_TYPE.attrs.type) || 'text'"
          :placeholder="$t('v_notice_placeholder_input') + $t(v.LABEL_ID)"
          :clearable="(v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.clearable) || true"
          @input="(e) => {formChange(e, v.COL_NAME)}"
          :disabled="v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y')"
        />
        <el-cascader
          v-else-if="v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.name === 'cascader'"
          v-model="paramsForm[v.COL_NAME]"
          :clearable="(v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.clearable) || true"
          v-bind="v.SEARCH_RENDER_TYPE.props"
          :placeholder="$t('v_notice_placeholder_select') + $t(v.LABEL_ID)"
          :options="v.SEARCH_RENDER_TYPE.options"
          :disabled="v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y')"
        />
        <el-select
          v-if="v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.name === 'combobox'"
          v-model="paramsForm[v.COL_NAME]"
          v-bind="v.SEARCH_RENDER_TYPE.props"
          :placeholder="$t('v_notice_placeholder_select') + $t(v.LABEL_ID)"
          :clearable="(v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.clearable) || true"
          :transfer="true"
          :filterable="(v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.filterable) || true"
          @change="(e) => {formChange(e, v.COL_NAME)}"
          :disabled="v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y')"
        >
          <el-option
            v-for="child in v.SEARCH_RENDER_TYPE.options"
            :key="child.value || child.label"
            :label="child.label"
            :value="child.value || child.label"
            v-bind="child.props"
          >
            <span class="option-contain">
              <span class="option-item one-line" :title="child.label">{{ child.label }}</span>
              <span class="option-item option-des one-line" :title="child[v.BIND_DISP_COLS.split(',')[1]]" v-if="getShowLabel(v)">{{ child[v.BIND_DISP_COLS.split(',')[1]]}}</span>
            </span>
          </el-option>
        </el-select>
        <el-date-picker
          v-if="v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.name === 'date'"
          v-model="paramsForm[v.COL_NAME]"
          v-bind="v.SEARCH_RENDER_TYPE.props"
          type="datetime"
          :placeholder="$t('v_notice_placeholder_select') + $t(v.LABEL_ID)"
          :picker-options="{disabledDate(e){return disabledDate(e,v)}}"
          @change="(e) => {formChange(e, v.COL_NAME)}"
          :clearable="(v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.clearable) || true"
          :disabled="v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y')"
        />
        <el-input
          v-if="(v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.name === 'textarea')"
          :placeholder="$t('v_notice_placeholder_input')+$t(v.LABEL_ID)"
          type="textarea"
          v-bind="v.SEARCH_RENDER_TYPE.props || {}"
          v-model.trim="paramsForm[v.COL_NAME]"
          :rows="(v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.rows) || 8"
          @change="(e) => {formChange(e, v.COL_NAME)}"
          :clearable="(v.SEARCH_RENDER_TYPE.props && v.SEARCH_RENDER_TYPE.props.clearable) || true"
          :disabled="v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y')"
        />
        <el-switch
          v-if="v.SEARCH_RENDER_TYPE && v.SEARCH_RENDER_TYPE.name === 'switch'"
          v-bind="v.SEARCH_RENDER_TYPE.props"
          v-model="paramsForm[v.COL_NAME]"
          :disabled="v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y')"
        />
      </el-form-item>
      <el-form-item :label="$t('v_para_find_model')" class="model-box" v-if="showEqpId"/>
      <el-form-item :label="$t('c_eqp_id')" prop="EQP_ID" v-if="showEqpId">
        <el-select
          v-model="EQP_ID"
          :placeholder="$t('v_notice_placeholder_select')+ $t('c_eqp_id')"
          :clearable="true"
          :filterable="true"
          :disabled="getDisabled"
          @change="(e) => {formChange(e, 'eqpId')}"
        >
          <el-option
            v-for="item in eqpList"
            :key="item.label"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
        <div class="tag-box" v-if="findArr.length > 0">
          <div v-for="eqp in findArr" :key="eqp.id" class="tag">
            <span>{{eqp.label}} : </span>
            <span>{{eqp.value}}</span>
          </div>
        </div>
      </el-form-item>
      <el-form-item v-if="!hiddenSearchButton">
        <el-button
          type="primary"
          :disabled="getDisabled"
          @click="onSubmit(searchRef)"
          >{{ $t('btn_search')}}</el-button
        >
        <el-button
          v-if="showReset"
          @click="toReset()"
          >{{ $t("btn_reset")}}</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import moment from 'moment'
import { toResetSearch,resetParams } from '@/commn/commonFn'
export default {
  props: {
    hiddenSearchButton:{
      type:Boolean,
      default:false
    },
    searchRef: {
      type: String,
      default: () => {
        return "ruleForm"
      },
    },
    labelWidth: {
      type: String,
      default: "80px",
    },
    data: {
      type: Array,
      default: () => {
        return []
      },
    },
    params: {
      type: Object,
      default: () => {
        return {}
      },
    },
    inline: {
      type: Boolean,
      default:false
    },
    showEqpId: {
      type: Boolean,
      default:false
    },
    showReset:{
      type: Boolean,
      default:true
    }
  },
  data() {
    return {
      formData: [],
      paramsForm: {},
      rules: {},
      eqpList:[],
      EQP_ID:'',
      findArr:[]
    }
  },
  computed: {
    getDisabled() {
      const filter = this.formData.filter((v) => v.disabled ? v.disabled : (v.READ_ONLY_YN === 'y'))
      return filter.length > 0 && filter.length === this.formData.length
    },
    getRule(){
      return function(item){
        const isRequired = item.SEARCH_MANDATORY_YN === 'y'
        const text = item?.SEARCH_RENDER_TYPE?.name === undefined || item?.SEARCH_RENDER_TYPE?.name === 'input' || item?.SEARCH_RENDER_TYPE?.name === 'textarea' ? 'v_notice_placeholder_input' : 'v_notice_placeholder_select'
        const message = this.$t(text) + this.$t(item.LABEL_ID)
        return isRequired ? [{ required: true, message: message, trigger:['blur','change']}] : []
      }
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(newParam){
        this.formData = newParam.filter((v) => !v.isHidden)
      }
    },
    params: {
      deep: true,
      immediate: true,
      handler(newParam) {
        this.paramsForm = newParam || {}
      }
    },
    'params.AREA_ID':{
      deep:true,
      immediate:true,
      handler(newParam,oldParam){
        if(!newParam){
          this.EQP_ID = null
          this.findArr = []
          this.eqpList = []
        }
        newParam && (newParam !== oldParam) && this.getEqpList()
      }
    }
  },
  methods: {
    //option下拉展示二次说明
    getShowLabel(item){
      return item.BIND_DISP_COLS && item.BIND_DISP_COLS.split(',').length > 1 && item.BIND_DISP_COLS.split(',')[1]
    },
    // 获取EQP数据
    async getEqpList(){
      if(this.showEqpId){
        let options = []
        if(this.paramsForm.AREA_ID){
          const { modelParaList } = this.$api.parameter
          const res = await modelParaList({FAC_ID:this.paramsForm.FAC_ID,AREA_ID:this.paramsForm.AREA_ID},'EQP_MANAGEMENT#select')
          options = resetParams(res.DATA || []).map(v => {
            return {
              ...v,
              label: v.EQP_ID,
              value: v.EQP_ID
            }
          })
        }
        this.eqpList = options
      }
    },
    //表单内容项的change事件
    formChange(data, key) {
      this.validateField(key)
      if(key === 'eqpId'){
        const findItem = this.eqpList.find(v=>v.value === data)
        this.findArr = findItem ? [
          {label:this.$t('v_para_vendor_eqp_model'),value:findItem.VENDOR_EQP_MODEL},
          // {label:this.$t('v_para_r2r_eqp_model'),value:findItem.R2R_EQP_MODEL},
        ] : []
        return
      }
      if(key === 'AREA_ID'){
        this.EQP_ID = null
        this.findArr = []
        this.eqpList = []
      }
      this._events.emitChild && this.$emit("emitChild", { data, key })
    },
    //搜索
    onSubmit(formName = this.searchRef) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return
        }
        this.$emit("submit", this.paramsForm)
      })
    },
    // 重置
    toReset(){
      this.$emit("reset", toResetSearch(this.paramsForm,this.formData))
    },
    // 禁用时间日期
    disabledDate(time,data){
      if(data.pickerOptions && data.pickerOptions.length > 0){
        if(data.pickerOptions[0] && data.pickerOptions[1]){
          return time < new Date(moment(data.pickerOptions[0],'YYYY-MM-DD 00:00:00')) || time > new Date(moment(data.pickerOptions[1],'YYYY-MM-DD 00:00:00'))
        }else if(data.pickerOptions[0]){
          return time < new Date(moment(data.pickerOptions[0],'YYYY-MM-DD 00:00:00'))
        }else{
          return time > new Date(moment(data.pickerOptions[1],'YYYY-MM-DD 00:00:00'))
        }
      }
      return false
    },
    // 单个校验
    validateField(name){
      this.$nextTick(()=>{
        this.$refs[this.searchRef].validateField(name)
      })
    },
    //取消校验
    clearValidate(){
      this.$refs[this.refForm].clearValidate()
    }
  }
}
</script>
<style lang="scss" scoped>
.model-box {
  border-top: 1px solid #ccc;
  margin-bottom: 0 !important;
}
.tag-box {
  background: #f5f5f5;
  margin-top: 6px;
  padding: 6px;
  border-radius: 6px;
  .tag {
    font-size: 12px;
    line-height: 1.6;
  }
}
/deep/ .el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
  .el-input__inner {
    padding-right: 10px;
  }
}
.el-form-item__content{
  .el-select, .vxe-input{
    width:100%;
  }
}
</style>
