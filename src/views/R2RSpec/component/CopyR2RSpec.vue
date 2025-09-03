<template>
  <div>
    <div class="m-t-10">
      <BaseTitle :title="$t('m_r2r_model')"/>
      <div class="m-t-10">
        <el-form ref="form" :model="r2rSpecObj" size="small" inline>
          <el-form-item :label="$t('c_eqp_id')">
            <el-input v-model="r2rSpecObj.EQP_ID" disabled/>
          </el-form-item>
          <el-form-item :label="$t('c_recipe_id')">
            <el-input v-model="r2rSpecObj.RECIPE_ID" disabled />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="m-t-10">
      <BaseTitle :title="$t('m_r2r_spec')"/>
      <div class="m-t-10">
        <div class="flex-box">
          <div class="m-r-20">
            <span class="m-r-10 font-size-12">{{$t('c_r2r_yn')}}</span>
            <el-switch v-model="r2rSpecObj.R2R_YN"/>
          </div>
          <div>
            <span class="m-r-10 font-size-12">{{$t('c_sample_yn')}}</span>
            <el-switch v-model="r2rSpecObj.SAMPLE_YN" />
          </div>
        </div>
      </div>
    </div>
    <div class="m-t-10">
      <BaseTitle :title="$t('m_r2r_spec')"/>
      <div class="m-t-10">
        <div>
          <el-radio-group v-model="r2rSpecObj.copyObj" @change="getRecipeOrEqpList">
            <el-radio :label="1">{{ $t("c_eqp_id") }}</el-radio>
            <el-radio :label="2">{{$t("c_recipe_id")}}</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div class="m-t-10" v-if="r2rSpecObj.copyObj === 1 || r2rSpecObj.copyObj === 2">
      <div class="m-b-10">
        <BaseTitle :title="r2rSpecObj.copyObj === 1 ? $t('v_dialog_title_eqp_list') : $t('v_dialog_title_recipe_list')"/>
      </div>
      <BaseTransfer
        :leftBaseProps="leftBaseProps"
        :rightBaseProps="rightBaseProps"
        :title="titleObj"
        @selects="getSelects"
      />
    </div>
  </div>
</template>
<script>
import BaseTransfer from "@/component/BaseTransfer";
import BaseTitle from "@/component/BaseTitle"
import { formatParam } from '@/commn/commonFn'
export default {
  components: {
    BaseTransfer,
    BaseTitle
  },
  props:{
    r2rSpecObj:{
      type:Object,
      default:()=>{return {}}
    }
  },
  data() {
    return {
      titleObj:{},
      columns:[
        {COL_NAME:"CHECK_ALL",width:60},
        {COL_NAME:"RECIPE_ID",LABEL_ID:'c_recipe_id'},
        {COL_NAME:"R2R_TIME",LABEL_ID:'c_r2r_time'}
      ],
      leftBaseProps:{},
      rightBaseProps:{}
    }
  },
  created() {},
  computed: {},
  methods: {
    // 相同eqp获取recipe lists 同一个eqp获取recipe  R2RMODEL_MANAGEMENT#selectRecip
    //相同recipe获取eap list  同一个recipe获取eqp  R2RMODEL_MANAGEMENT#selectEq
    async getRecipeOrEqpList(){
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(this.r2rSpecObj,this.r2rSpecObj.copyObj === 2 ? 'R2RMODEL_MANAGEMENT#selectRecipe' : 'R2RMODEL_MANAGEMENT#selectEqp')
      this.columns[1] = this.r2rSpecObj.copyObj === 2 ? {COL_NAME:"RECIPE_ID",LABEL_ID:'c_recipe_id'} : {COL_NAME:"EQP_ID",LABEL_ID:'c_eqp_id'}
      this.leftBaseProps.columns = this.columns
      this.rightBaseProps.columns = this.columns
      this.$set(this.leftBaseProps,'data',formatParam((res.DATA||[]),[{time:'R2R_TIME'}]))
      this.$set(this.rightBaseProps,'data',[])
      this.titleObj = {
        left:(this.r2rSpecObj.copyObj === 2 ? this.$t('v_dialog_title_recipe_list') : this.$t('v_dialog_title_eqp_list'))  + ' - ' + this.$t('v_dialog_title_source'),
        right:(this.r2rSpecObj.copyObj === 2 ? this.$t('v_dialog_title_recipe_list') : this.$t('v_dialog_title_eqp_list')) + ' - ' + this.$t('v_dialog_title_destination')
      }
    },
    getSelects(data){
      this.$emit("selects",data)
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form-item{
  margin-bottom: 0;
}
</style>
