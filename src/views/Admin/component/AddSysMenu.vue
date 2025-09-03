<template>
  <div>
    <el-form
      :model="ruleFormData"
      :rules="rules"
      :ref="refForm"
      :label-width="labelWidth"
    >
      <el-form-item :label="$t('v_dialog_menu_list')" prop="UPPER_MENU_ID" size="small">
        <el-cascader
          width="100%"
          :disabled="ruleFormData.type === 'addSub'"
          :placeholder="$t('v_notice_select_menu')"
          :options="ruleFormData.menus"
          :props="{ checkStrictly: true }"
          filterable 
          v-model="ruleFormData.UPPER_MENU_ID"
        />
      </el-form-item>
      <BaseTableForm
        :ruleForm="ruleFormData"
        :tableColumn="tableColumn"
        :rules="rules"
        ref="childForm"
        :labelWidth="labelWidth"
      />
    </el-form>
  </div>
</template>
<script>
import BaseTableForm from "@/component/BaseTableForm"
export default {
  props: {
    ruleForm: {
      type: Object,
      default: () => {
        return {};
      },
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    tableColumn: {
      type: Array,
      default: () => {
        return [];
      },
    },
    refForm: {
      type: String,
      default: () => {
        return "ruleForm";
      },
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
  },
  components: {
    BaseTableForm
  },
  data() {
    return {
      ruleFormData:{},
      menus:[]
    }
  },
  created() {},
  computed: {},
  methods: {},
  watch:{
    ruleForm:{
      immediate:true,
      deep:true,
      handler(newData){
        this.ruleFormData = newData
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.el-cascader{
  width: 100%;
}
.contain-table{
  overflow: hidden;
}
</style>
