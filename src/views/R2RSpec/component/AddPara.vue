<template>
  <div>
    <div>
      <div class="m-b-10" v-if="showCondition">{{$t('v_dialog_title_r2r_para_format')}} : {{$t('v_dialog_title_r2r_para_format_value')}}</div>
      <BaseTable :tableOptions="tableOptions" @handleTableChange="handleTableChange" ref="tableRef" :showRenderType="true"/>
    </div>
  </div>
</template>
<script>     
import BaseTable from "@/component/BaseTable"
export default {
  components: {
    BaseTable
  },
  props:{
    searchParams:{
      type:Object,
      default:()=>{return {}}
    },
    tableData:{
      type:Object,
      default:()=>{return {}}
    },
    title:{
      type:String,
      default:''
    }
  },
  data() {
    return {
      tableOptions:{
        toolbarConfig:{
          import: false,
          export: false,
          print: false,
          zoom: false,
          custom: false,
          refresh:false,
          buttons:[]
        },
        data:[],
        columns:[],
        ...this.tableData
      }
    }
  },
  computed:{
    showCondition(){
      return this.title && this.searchParams.AREA_ID === 'ETCH' || this.searchParams.AREA_ID === 'T/F'
    },
    getColumn(){
      return this.title ? (this.showCondition ? this.currentParaColumns : this.currentParaColumns.slice(-1)) : this.columns 
    }
  },
  created() {},
  methods: {
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["checkbox",() => {this.toCheckbox(data.data)}],
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 多选
    toCheckbox(data){
      data.rowIndex === undefined 
        ? this.tableOptions.data = this.tableOptions.data.map(v=>{
          return {...v,checked:data.checked }
        })
        :this.tableOptions.data[data.rowIndex] = {...this.tableOptions.data[data.rowIndex],checked:data.checked}
    },
    getSelectData(){
      return this.tableOptions.data.filter(v=>v.checked)
    }
  },
  watch:{
    tableData:{
      immediate:true,
      deep:true,
      handler(newData){
        this.tableOptions.data = newData.data || []
        this.tableOptions.columns = newData.columns || []
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .vxe-input{
  width: 100%;
}
</style>
