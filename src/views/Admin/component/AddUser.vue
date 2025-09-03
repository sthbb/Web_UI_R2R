<template>
  <div>
    <div class="m-b-18 font-12">
      <span class="m-r-20">
        <span class="require-text">*</span>
        {{$t('v_dialog_title_priv')}}
      </span>
      <el-select v-model="userData.PRIV_ID" :placeholder="$t('v_notice_select_priv')" :disabled="!!searchParams.PRIV_ID" @change="selectPriv">
        <el-option
          v-for="item in userData.privList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div>
      <BaseTransfer
        :leftBaseProps="leftBaseProps"
        :rightBaseProps="rightBaseProps"
        :title="titleObj"
        ref="transfer"
      />
    </div>
  </div>
</template>
<script>
import BaseTransfer from "@/component/BaseTransfer";
export default {
  components: {
    BaseTransfer
  },
  props:{
    addUserData:{
      type:Object,
      default:()=>{return {
        addTableData:[],
        tableData:[],
        PRIV_ID:''
      }}
    },
    searchParams:{
      type:Object,
      default:()=>{return {}}
    }
  },
  data() {
    return {
      userData:{},
      titleObj:{
        left:this.$t('v_dialog_title_not_add_user'),
        right:this.$t('v_dialog_title_add_user') 
      },
      columns:[
        {COL_NAME:'CHECK_ALL'},
        {COL_NAME:'ROW_NUM',LABEL_ID:this.$t("v_dialog_col_row_num")},
        {COL_NAME:'USER_NAME',LABEL_ID:'c_user_name'},
        {COL_NAME:'USER_ID',LABEL_ID:'c_user_id'},
        {COL_NAME:'USER_TYPE',LABEL_ID:'c_user_type'}
      ],
      leftBaseProps:{},
      rightBaseProps:{}
    }
  },
  created() {},
  methods: {
    selectPriv(data){
      this.$emit('selectPriv',data)
    }
  },
  watch:{
    addUserData:{
      immediate:true,
      deep:true,
      handler(newData){
        this.leftBaseProps.columns = this.columns
        this.rightBaseProps.columns = this.columns
        this.$set(this.rightBaseProps,'data',newData.addTableData.map(v=>{return {...v,ID:Math.random()}}))
        this.$set(this.leftBaseProps,'data',newData.tableData.map(v=>{return {...v,ID:Math.random()}}))
        this.userData = newData
      }
    }
  }
}
</script>
