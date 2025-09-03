<template>
    <div>
      <el-popover
        placement="bottom"
        trigger="click"
        v-model="visible"
        @hide="hide"
      >
        <div>
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">{{$t('c_check_all')}}</el-checkbox>
          <div class="cloumns-contain">
            <el-checkbox-group v-model="checkedColumns" @change="checkChange">
              <el-checkbox v-for="column in columnsList" :label="column.COL_NAME" :key="column.COL_NAME">{{$t(column.LABEL_ID)}}</el-checkbox>
            </el-checkbox-group>
            <div class="btn-ope">
              <el-button @click="reset">{{$t('btn_reset')}}</el-button>
              <el-button type="primary" @click="confirm">{{$t('btn_confirm')}}</el-button>
            </div>
          </div>
        </div>
        <el-button slot="reference" icon="el-icon-s-grid" round :title="$t('com_column_setting')"></el-button>
      </el-popover> 
    </div>
</template>
<script>
export default {
  props:{
    columns:{
      type:Array,
      default:()=>{
        return []
      }
    }
  },
  data() {
    return {
      checkAll:false,
      checkedColumns:[],
      isIndeterminate:false,
      visible:false
    }
  },
  created(){
  },
  methods:{
    checkAllChange(checked){
      this.checkedColumns = checked ? this.columnsList.map(v=>v.COL_NAME) : [];
      this.isIndeterminate = false;
    },
    checkChange(checks){
      let checkedCount = checks.length;
      this.checkAll = checkedCount === this.columnsList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnsList.length;
    },
    reset(){
      this.checkedColumns = this.columnsList.map(v=>v.COL_NAME)
      this.confirm()
    },
    confirm(){
      this.visible = false
      this.$emit('columnConfirm',this.checkedColumns)
    },
    showData(newData){
      this.checkedColumns = newData.filter(v=>v.visible || v.visible === undefined).map(v=>v.COL_NAME)
      this.checkAll =  this.checkedColumns.length === newData.length
      this.isIndeterminate = this.checkedColumns > 0 &&  this.checkedColumns.length < newData.length
    },
    hide(){
      this.showData(this.columns)
    }
  },
  watch:{
    columns:{
      immediate:true,
      deep:true,
      handler(newData){
        this.showData(newData)
        this.columnsList = newData
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.cloumns-contain{
  border-top: 1px solid #ccc;
  margin-top: 8px;
  padding-top: 10px;
  min-width: 144px;
  padding-bottom: 38px;
  .el-checkbox-group{
    max-height: 200px;
    overflow-y: auto;
    .el-checkbox{
      display: block;
    }
  }
  .btn-ope{
    position: absolute;
    bottom: 10px;
  }
}
</style>
