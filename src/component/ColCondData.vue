<template>
  <div>
    <div class="inline-box">
      <span class="m-r-10">{{ $t("v_col_setting_belong_area") }}</span>
      <el-checkbox-group v-model="condData.HAS_AREA_ID" @change="getCondtData" :disabled="getDisabled">
        <el-checkbox v-for="area in areas" :label="area.AREA_ID" :key="area.AREA_ID">{{area.AREA_ID}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="inline-box" v-if="!condData.isSearch">
      <span class="m-r-10">{{ $t("v_col_setting_pattern") }}</span>
      <div>
        <el-input v-model="condData.HAS_PATTERN" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_pattern')" @change="getCondtData" :disabled="getDisabled || condData.COL_TYPE !== 'input'"/>
        <el-input v-model="condData.HAS_MESSAGE" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_pattern_message')" @change="getCondtData" :disabled="getDisabled || condData.COL_TYPE !== 'input'"/>
      </div>
    </div>
     <!-- 级联控制字段是一一对应的关系 -->
    <div class="inline-box" v-if="!condData.isSearch">
      <span class="m-r-10">{{ $t("v_col_setting_control") }}</span>
      <div>
        <el-switch v-model="condData.HAS_COL_CONTROL_YN" @change="getCondtData" :disabled="getDisabled || condData.COL_TYPE !== 'combobox'"></el-switch>
      </div>
    </div>
    <div class="inline-box" v-if="!condData.isSearch">
      <span class="m-r-10">{{ $t("v_col_setting_edit_control") }}</span>
      <div>
        <el-switch v-model="condData.HAS_USED_NO_EDIT" @change="getCondtData" :disabled="getDisabled || (condData.COL_TYPE !== 'combobox' && condData.COL_TYPE !== 'input')"></el-switch>
        <div class="common-tip">{{$t('v_col_setting_edit_model_para_control')}}</div>
      </div>
    </div>
    <div class="inline-box" v-if="!condData.isSearch">
      <span class="m-r-10">{{ $t("v_col_setting_range_setting") }}</span>
      <div class="range-box">
        <el-input v-model="condData.HAS_MIN" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_min')" @change="getCondtData" :disabled="getDisabled || condData.COL_TYPE !== 'number'"/>~
        <el-input v-model="condData.HAS_MAX" :placeholder="$t('v_notice_placeholder_input') + $t('v_col_setting_max')" @change="getCondtData" :disabled="getDisabled ||condData.COL_TYPE !== 'number'"/>
      </div>
    </div>
  </div>
</template>
<script>
import { formatParam } from '@/commn/commonFn'
export default {
  props:{
    colCondData:{
      type:Object,
      default:()=>{return {}}
    }
  },
  data() {
    return {
      condData: {
        HAS_AREA_ID:[],
        HAS_PATTERN: '',
        HAS_MESSAGE: '',
        HAS_COL_CONTROL_YN:false,
        HAS_USED_NO_EDIT:false
      },
      areas:[]
    }
  },
  created() {
    this.getArea()
  },
  computed: {
    getDisabled(){
      return !(!!this.condData.tableType)
    }
  },
  methods: {
    async getArea(){
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList({FAC_ID:null},'AREA_MANAGEMENT#select')
      this.areas = formatParam((res.DATA||[]))
    },
    getCondtData(){
      this.$emit('change',this.condData)
    }
  },
  watch:{
    colCondData:{
      immediate:true,
      deep:true,
      handler(newData){
        this.condData = {...newData}
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.inline-box{
  display: flex;
  > div{
    flex: 1;
  }
}
.range-box{
  display: flex;
  grid-gap: 10px;
}
</style>
