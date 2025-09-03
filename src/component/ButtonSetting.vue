<template>
  <div class="button-setting-box">
    <el-select v-model="value" :placeholder="this.$t('v_notice_select_icon')" @change="selectChange" :disabled="getDisabled">
      <el-option
        v-for="item in isActionBar ? actionsBars : buttons"
        :key="item.title"
        :value="item.title"
        >
        <span class="button-icon">
          <i :class="item.icon"></i>
        </span>
        <span style="float: right">{{$t(item.title)}}</span>
      </el-option>
    </el-select>
  </div>
</template>
<script>
import IconPicker from "@/component/IconPicker"; //图标选择器
export default {
  props:{
    colButtonObj:{
      type:Object,
      default:()=>{return {}}
    },
    isActionBar:{
      type:Boolean,
      default:()=>{return false}
    },
    getDisabled:{
      type:Boolean,
      default:()=>{return false}
    }
  },
  data() {
    return {
      value:''
    }
  },
  created() {},
  computed: {
    buttons(){
      return [
        {title:this.$t('btn_view_formula'),icon:'customer icon-chakansuanfa'},
        {title:this.$t('btn_edit_formula'),icon:'customer icon-chakansuanfa'},
        {title:this.$t('btn_r2r_result_code'),icon:'customer icon-chakanziji'},
        {title:this.$t('btn_view_weight'),icon:'customer icon-chakanquanzhong'},
        {title:this.$t('btn_edit_weight'),icon:'customer icon-chakanquanzhong'},
        {title:this.$t('btn_view_detail'),icon:'el-icon-view'}
      ]
    },
    actionsBars(){
      return [
        {title:this.$t('btn_edit'),icon:'fa fa-edit'},
        {title:this.$t('btn_delete'),icon:'fa fa-trash'},
        {title:this.$t('btn_view_history'),icon:'customer icon-chakanlishi'},
        {title:this.$t('btn_model_spec'),icon:'customer icon-R2Rmoxing'},
        {title:this.$t('btn_sub'),icon:'customer icon-chakanziji'},
        {title:this.$t('btn_add_menu'),icon:'fa fa-plus'},
        {title:this.$t('btn_user_menu'),icon:'el-icon-menu'},
        {title:this.$t('btn_priv_menu'),icon:'el-icon-menu'},
        {title:this.$t('btn_priv_user'),icon:'el-icon-user'},
        {title:this.$t('btn_view_detail'),icon:'el-icon-view'},
        {title:this.$t('btn_password'),icon:'el-icon-key'},
        {title:this.$t('btn_resetpassword'),icon:'el-icon-key'}
      ]
    }
  },
  methods: {
    selectChange(e){
      const buttons = this.isActionBar ? this.actionsBars : this.buttons
      const buttonObj = buttons.find(v=>e === v.title) || {}
      this.$emit("change", buttonObj)
    }
  },
  watch:{
    colButtonObj:{
      immediate:true,
      deep:true,
      handler(newData){
        this.value = newData.title ? this.$t(newData.title) : ''
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.button-setting-box{
  display: inline-block;
}
.button-icon{
  float: left;
  font-size: 16px;
  .customer{
    font-size: 16px !important;
  }
}
</style>
