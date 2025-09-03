<template>
  <div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="140px"
      class="demo-ruleForm"
      size="small"
    >
      <el-form-item :label="$t('v_dialog_title_origin_password')" prop="PWD_OLD">
        <el-input v-model.trim="ruleForm.PWD_OLD" show-password clearable :placeholder="$t('v_notice_input_origin_password')" />
      </el-form-item>
      <el-form-item :label="$t('v_dialog_title_new_password')" prop="PWD_NEW">
        <el-input v-model.trim="ruleForm.PWD_NEW" show-password clearable :placeholder="$t('v_notice_input_new_password')" />
      </el-form-item>
      <el-form-item :label="$t('v_dialog_title_again_password')" prop="PWD_AGAIN">
        <el-input v-model.trim="ruleForm.PWD_AGAIN" show-password clearable :placeholder="$t('v_notice_input_again_password')" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  props:{
    ruleForm:{
      type:Object,
      default:()=>{return {}}
    }
  },
  data() {
    return {}
  },
  created() {},
  computed: {
    rules(){
      return {
        PWD_OLD: [{ required: true, message: this.$t('v_notice_input_origin_password'), trigger: 'blur' }],
        PWD_NEW: [{ required: true, message: this.$t('v_notice_input_new_password'), trigger: 'blur' }],
        PWD_AGAIN: [{ required: true, message: this.$t('v_notice_input_again_password'), trigger: 'blur' }]
      }
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
/deep/ .vxe-input, .el-select{
  width: 100%;
}
</style>
