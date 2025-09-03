<template>
    <div class="select-common-box">
      <div class="left-box common-box" v-if="showSource">
        <div  class="m-b-10" v-if="title.left"><BaseTitle :title="title.left"/></div>
        <div class="list">
          <BaseTable :tableOptions="tableLeft" @handleTableChange="(data)=>{handleTableChange(data,1)}"/>
        </div>
      </div>
      <div class="arror-box" v-if="showSource">
        <el-button type="primary" class="arror-left caret-common" @click="toLeft" :disabled="tableRight.data && tableRight.data.filter(v=>v.checked).length === 0">&lt;</el-button>
        <el-button type="primary" class="arror-right caret-common" @click="toRight" :disabled="tableLeft.data && tableLeft.data.filter(v=>v.checked).length === 0"> &gt;</el-button>
      </div>
      <div class="right-box common-box">
        <div  class="m-b-10" v-if="title.right"><BaseTitle :title="title.right"/></div>
        <div class="list">
          <BaseTable :tableOptions="tableRight"  @handleTableChange="(data)=>{handleTableChange(data,2)}"/>
        </div>
      </div>
    </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import BaseTitle from "@/component/BaseTitle"
export default {
  components:{
    BaseTable,
    BaseTitle
  },
  props:{
    leftBaseProps:{
      type:Object,
      default:()=>{return {}}
    },
    rightBaseProps:{
      type:Object,
      default:()=>{return {}}
    },
    title:{
      type:Object,
      default:()=>{return {}}
    },
    showSource:{
      type:Boolean,
      default:true
    }
  },
  data() {
    return {
      commonConfig:{
        toolbarConfig:{
          import: false,
          export: false,
          print: false,
          zoom: false,
          custom: false,
          refresh:false,
          buttons:[]
        },
        columns:[],
        data:[]
      },
      tableLeft:{},
      tableRight:{}
    }
  },
  created(){
  },
  computed:{
  },
  methods:{
    handleTableChange(data,type){
      const tableType = new Map([
        ["checkbox",() => {this.toCheckbox(data.data,type)}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // check
    toCheckbox(data,type){
      const index = data.rowIndex
      const checked = data.checked
      const isMutil = data.rowIndex === undefined
      if(type === 1){
        isMutil ? this.tableLeft.data = this.tableLeft.data.map(v=>{return {...v,checked}}) : this.tableLeft.data[index].checked = checked
      }else{
        isMutil ? this.tableRight.data = this.tableRight.data.map(v=>{return {...v,checked}}) : this.tableRight.data[index].checked = checked
      }
      this.confirmSelect()
    },
    //增加
    toRight(){
      const adds = this.tableLeft.data.filter(v=>v.checked).map(m=>{return {...m,tableType:this.leftBaseProps.data.findIndex(k=>k.ID === m.ID) > -1 ? 'add' : ''}})
      this.tableLeft.data = this.tableLeft.data.filter(v=>!v.checked).map((v,i)=>{return {...v,ROW_NUM:i+1}})
      this.tableRight.data = [...this.tableRight.data,...adds.map(v=>{return {...v,checked:false}})].map((v,i)=>{return {...v,ROW_NUM:i+1}})
    },
    // 删除
    toLeft(){
      const removes = this.tableRight.data.filter(v=>v.checked).map(m=>{return {...m,tableType:this.rightBaseProps.data.findIndex(k=>k.ID === m.ID) > -1 ? 'add' : ''}})
      this.tableRight.data = this.tableRight.data.filter(v=>!v.checked).map((v,i)=>{return {...v,ROW_NUM:i+1}})
      this.tableLeft.data = [...this.tableLeft.data,...removes.map(v=>{return {...v,checked:false}})].map((v,i)=>{return {...v,ROW_NUM:i+1}})
      this.confirmSelect()
    },
    // 确定选择
    confirmSelect(){
      const selects = this.tableRight.data.filter(v=>v.checked)
      this.$emit("selects",selects)
    },
    // 清空数据
    clear(){
      this.tableRight.data = this.tableRight.data.map(v=>{return {...v,checked:false,disabled:false}})
      this.tableLeft.data = this.tableLeft.data.map(v=>{return {...v,checked:false,disabled:false}})
    }
  },
  watch:{
    leftBaseProps:{
      immediate:true,
      deep:true,
      handler(newData){
        this.tableLeft = {...this.commonConfig,...newData}
        this.tableLeft.data = this.tableLeft.data.map(v=>{return {...v}})
      }
    },
    rightBaseProps:{
      immediate:true,
      deep:true,
      handler(newData){
        this.tableRight = {...this.commonConfig,...newData}
        this.tableRight.data = this.tableRight.data.map(v=>{return {...v}})
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .select-common-box{
    display: flex;
    gap: 16px;
    .common-box{
      flex: 1;
      border: 1px solid #ececec;
      border-radius: 10px;
      padding: 10px;
      .title{
        font-weight: bold;
      }
      .list{
        width: 100%;
        max-height: 300px;
        overflow: auto;
      }
    }
    .arror-box{
      display: flex;
      flex-direction: column;
      justify-content: center;
      .caret-common{
        width: 36px;
        height: 36px !important;
        text-align: center;
        margin-left: 0 !important;
        margin-bottom: 18px;
        &:last-child{
          margin-bottom: 0;
        }
      }
    }
  }
  /deep/ .vxe-table--tooltip-wrapper{
    z-index: 10000 !important;
  }
</style>
