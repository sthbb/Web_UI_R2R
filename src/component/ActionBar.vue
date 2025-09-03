<template>
  <div>
    <el-form ref="form" label-width="120px">
      <el-form-item :label="$t('v_col_setting_action')">
        <div v-for="(code,index) in codes" :label="code.value" :key="code.value" class="flex-box">
          <el-checkbox v-model="code.checked" @change="(data)=>{selectCode(index,data)}" :disabled="getDisabled">{{$t(code.label)}}</el-checkbox>
          <ButtonSetting class="m-l-10" @change="(data)=>{getBarInfo(index,data)}" :colButtonObj="code" :getDisabled="getDisabled" :isActionBar="true"/>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import ButtonSetting from "@/component/ButtonSetting";
export default {
  components:{ButtonSetting},
  props:{
    actionBar:{
      type:Array,
      default:()=>{return []}
    },
    getDisabled:{
      type:Boolean,
      default:()=>{return false}
    }
  },
  data() {
    return {
      codes:[
        {label:this.$t('btn_edit'),value:'edit'},
        {label:this.$t('btn_delete'),value:'del'},
        {label:this.$t('btn_history'),value:'history'},
        {label:this.$t('btn_detail'),value:'detail'},
        {label:this.$t('btn_password'),value:'password'},
        {label:this.$t('btn_resetpassword'),value:'resetpassword'},
        {label:this.$t('btn_jumpusermenu'),value:'jumpusermenu'},
        {label:this.$t('btn_jumpmenu'),value:'jumpmenu'},
        {label:this.$t('btn_jumpuser'),value:'jumpuser'},
        {label:this.$t('btn_jumpmodelspec'),value:'jumpmodelspec'},
        {label:this.$t('btn_add_menu'),value:'addMenu'}
      ]
    }
  },
  created() {},
  computed: {},
  methods: {
    // 操作title code
    getBarInfo(index,data){
      const newData = {...this.codes[index],...data}
      this.codes.splice(index,1,newData)
      this.$emit("change",this.codes)
    },
    // code 筛选
    selectCode(index,data){
      const newData = {...this.codes[index],code:data}
      this.codes.splice(index,1,newData)
      this.$emit("change",this.codes)
    }
  },
  watch:{
    actionBar:{
      immediate:true,
      deep:true,
      handler(newData){
        this.codes = this.codes.map(v=>{
          const hasNewData = newData.find(m=>m.code === v.value) || {}
          const newCode = {...v,...hasNewData,checked:Object.keys(hasNewData).length > 0}
          return newCode
        })
      }
    }

  }
}
</script>
<style lang="scss" scoped>
/deep/ .ui-fas{
  display: flex;
}
</style>
