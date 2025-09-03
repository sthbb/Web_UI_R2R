<template>
  <div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_select_show_name") }}</span>
      <el-input v-model="selectProps.BIND_COL_NAME" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_select_show_name')" @change="getSelectData"/>
    </div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_select_interface_name") }}</span>
      <el-input v-model="selectProps.HAS_BIND_QUERY_NAME" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_select_interface_name')" @change="getSelectData"/>
    </div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_select_tip_name") }}</span>
      <el-input v-model="selectProps.HAS_BIND_TIP_NAME" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_select_tip_name')" @change="getSelectData"/>
    </div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_select_interface_extral_name") }}</span>
      <el-input v-model="selectProps.HAS_BIND_QUERY_EXTRAl_NAME" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_select_interface_extral_name')" @change="getSelectData"/>
    </div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_select_interface_type") }}</span>
      <el-select v-model="selectProps.BIND_QUERY_TYPE" :placeholder="$t('v_notice_placeholder_select') + $t('v_col_setting_select_interface_type')" @change="getSelectData">
        <el-option
          v-for="item in interfaceTypes"
          :key="item.value"
          :label="$t(item.label)"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_select_interface") }}</span>
      <el-input v-model="selectProps.BIND_QUERY_ID" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_select_interface')" @change="getSelectData"/>
    </div>
    <div class="inline-box" v-if="selectProps.BIND_QUERY_TYPE === 'Service'">
      <span class="m-r-10">{{ $t("v_col_setting_select_interface_params") }}</span>
      <el-input v-model="selectProps.QUERY_PARA_COLS" type="textarea" :rows="6" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_select_interface_params')" @change="getSelectData"/>
    </div>
  </div>
</template>
<script>
export default {
  props:{
    colSettingProps:{
      type:Object,
      default:()=>{return {}}
    }
  },
  data() {
    return {
      interfaceTypes:[
        {label:'Service',value:'Service'},
        {label:'Query',value:'Query'},
      ],
      selectProps:{
        BIND_COL_NAME:'',
        HAS_BIND_QUERY_NAME:'',
        HAS_BIND_TIP_NAME:'',
        HAS_BIND_QUERY_EXTRAl_NAME:'',
        BIND_QUERY_TYPE:'Service',
        BIND_QUERY_ID:'',
        QUERY_PARA_COLS:''
      }
    }
  },
  created() {},
  computed: {},
  methods: {
    getSelectData(){
      this.$emit('change',this.selectProps)
    }
  },
  watch:{
    colSettingProps:{
      immediate:true,
      deep:true,
      handler(newData){
        this.selectProps = {...newData}
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.inline-box{
  display: flex;
  > div{
    flex: 1;
  }
}
</style>
