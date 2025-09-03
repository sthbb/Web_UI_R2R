<template>
  <div class="contain-table">
    <el-form
      :model="ruleForm"
      :ref="refForm"
      :label-width="labelWidth"
      size="small"
    >
      <el-form-item
        v-for="item in showColumns"
        :key="item.COL_NAME"
        :prop="item.COL_NAME"
        :label="$t(item.LABEL_ID)"
        :rules="getRule(item)"
      >
        <span v-if="getShowType(item,ruleForm,'text')">{{ruleForm[item.COL_NAME]}}</span>
        <Input :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'input')" />
        <Number :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'number')"/>
        <Cascader :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'cascader')" />
        <Textarea :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'textarea')" />
        <R2RSwitch :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'switch')" />
        <Icon :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'icon')" @change="(e)=>{$set(ruleForm,item.COL_NAME,e);validateField(item.COL_NAME)}" />
        <Select :item="item" :row="ruleForm" v-if="getShowType(item,ruleForm,'combobox')" />
        <div class="common-tip" v-if="item.desTip">{{item.desTip || ''}}</div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { noUserParams } from '@/commn/commonFn'
import Input from './ComponentLibrary/Input'
import Number from './ComponentLibrary/Number'
import Cascader from './ComponentLibrary/Cascader'
import Textarea from './ComponentLibrary/Textarea'
import R2RSwitch from './ComponentLibrary/R2RSwitch'
import Icon from './ComponentLibrary/Icon'
import Select from './ComponentLibrary/Select'
import { getShowType } from '@/commn/commonFn'
export default {
  components: {Input,Number,Cascader,Textarea,R2RSwitch,Icon,Select },
  props:{
    ruleForm:{
      type:Object,
      default:()=>{return {}}
    },
    tableColumn:{
      type:Array,
      default:()=>{return []}
    },
    refForm:{
      type:String,
      default:()=>{return 'ruleForm'}
    },
    labelWidth:{
      type:String,
      default:()=>{return '100px'}
    },
    addPassword:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      getShowType
    }
  },
  computed: {
    showColumns(){
      //用户管理新增密码
      const passwordObj = {COL_NAME:'PASSWORD',CREATE_INPUT_YN:'y',EDIT_ALLOW_YN:'n',MANDATORY_YN:'y',LABEL_ID:'password',COL_TYPE:{name:"input",attrs:{type:'password'}}}
      let newColumns = this.tableColumn.filter(v=>!noUserParams.includes(v.COL_NAME))
      this.addPassword && newColumns.splice(2,0,passwordObj)
      return  newColumns.filter(v=>v.visible || v.visible === undefined)
    },
    getRule(){
      return function(item){
        const text = !item.COPY_TYPE || !item.COL_TYPE.name || ( item.COL_TYPE.name === 'input' || item.COL_TYPE.name === 'textarea') ? 'v_notice_placeholder_input' : 'v_notice_placeholder_select'
        const message = this.$t(text) + this.$t(item.LABEL_ID)
        const rules = []
        if(item?.MANDATORY_YN === 'y'){// 必填检验
          const require = {required: true,message}
          rules.push(require)
        }
        if(item?.COL_DATA_COND?.PATTERN){// 正则表达式检验
          const selfMessage =  item?.COL_DATA_COND?.MESSAGE || ''
          const pattern = item?.COL_DATA_COND?.PATTERN ? eval(item?.COL_DATA_COND?.PATTERN) : null
          const validaRule = {pattern:pattern,message:this.$t(selfMessage) || message}
          rules.push(validaRule)
        }
        return rules
      }
    }
  },
  methods: {
    // 单个校验
    validateField(name){
      this.$nextTick(()=>{
        this.$refs[this.refForm].validateField(name)
      })
    },
    //取消校验
    clearValidate(){
      this.$refs[this.refForm].clearValidate()
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .vxe-input, .el-select{
  width: 100%;
}
.contain-table{
  overflow-y: auto;
  overflow-x: hidden;
}
/deep/ .el-form-item__content{
  font-size: 12px;
  .el-input{
    height: 100% !important;
  }
}
</style>
