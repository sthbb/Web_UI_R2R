<template>
  <div>
    <BaseTable :tableOptions="{...tableOptions,exportTitle:$t(title)+ ' - '+$t('c_formula')}"  @handleTableChange="handleTableChange" ref="tableRef"/>
    <el-dialog :visible.sync="addFomulaVisible" :width="showHistory ? '80%' :'50%'" :append-to-body="true" :before-close="()=>{addFomulaIsVisible(false);showHistory=false}">
      <span slot="title">
        <div class="diolag-box" :style="{background:$root.theme}">
          <div>{{showHistory ? $t('v_dialog_title_view_history') : (formula.FORMULA_KEY ? $t('v_dialog_title_edit_formula') : $t('v_dialog_title_add_formula'))}}</div>
        </div>
      </span>
      <ViewHistory v-if="showHistory" ref="viewHistory" :timeArr="timeArr" :switchArr="switchArr" :columns="tableOptions.columns" api="FORMULAHIST_MANAGEMENT#select" />
      <AddFomula v-else :formula="formula" :ref="'formulaRef'" @formulaEpx="formulaEpx"/>
      <span slot="footer">
        <el-button v-if="showHistory" type="primary" @click="addFomulaIsVisible(false);showHistory = false">{{$t('btn_close')}}</el-button>
        <template v-else>
          <el-button @click="addFomulaIsVisible(false);showHistory = false">{{$t('btn_cancel')}}</el-button>
          <el-button :type="!isNeedVerify ? 'default' : 'primary'" @click="formulaVerify" :disabled="!isNeedVerify">{{$t('btn_formula_verify')}}</el-button>
          <el-button :type="isNeedVerify ? 'default' : 'primary'" @click="formulaSubmit" :disabled = "orignalRemark === (formula.REMARK ? formula.REMARK.trim() : formula.REMARK)">{{$t('btn_confirm')}}</el-button>
        </template>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import BaseTable from "@/component/BaseTable" 
import AddFomula from './AddFomula'
import ViewHistory from '../../R2RSpec/component/ViewHistory'
import { getHasPrivTip } from '@/commn/decoratorFn'
import { loadColumns,clearSort,resetData,toCheckbox } from '@/commn/comTable'
import {getFormulaResult,formulaVariate,axiosParams,getFormulaResultNew,commonDel,formulaResult,objValueIsNull,searchRequireParams,getFinallyData} from '@/commn/commonFn'
export default {
  props:{
    searchForm:{
      type:Array,
      default:()=>{return []}
    },
    searchParams:{
      type:Object,
      default:()=>{return {}}
    },
    height:{
      type:Number,
      default:0
    },
    FUNC_ID:{
      type:String,
      default:''
    },
    title:{
      type:String,
      default:''
    }
  },
  components: {
    BaseTable,
    AddFomula,
    ViewHistory
  },
  data() {
    return {
      GRID_ID:'FORMULA',
      specialkeyArr:[],
      timeArr:[],
      switchArr:[],
      numberArr:[],//number类型集合
      tableOptions: {
        id: "FORMULA_KEY",
        columns: [],
        data: [],
        toolbarConfig:{
          buttons:[{ code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"}]
        },
        actions:[]
      },
      addFomulaVisible:false,
      formula:{FORMULA_EXP:'',REMARK:'',formulaValues:[]},
      opeIndex:undefined,
      actions:[],
      showHistory:false,
      orignalRemark:''
    }
  },
  async created() {
    loadColumns.call(this)
  },
  methods: {
    // 获取数据
    async initData(reloadSearchData){
      reloadSearchData && await loadColumns.call(this)
      this.load()
    },
    // table操作处理
    handleTableChange(data) {
      const tableType = new Map([
        ["add",() => {this.toAdd()}],
        ["edit",() => {this.toEdit(data.data)}],
        ["checkbox",() => {toCheckbox.call(this,data.data)}],
        ["delete",() => {this.toDel(data.data)}],
        ["page",() => {this.$emit('initData',false)}],
        ["history",() => {this.toHistory(data.data)}],
        ["sort",() => {this.tableOptions.data = data.data.map((v,i)=>{return {...v,ROW_NUM:i+1}})}]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    },
    // 加载列表
    async load(params = this.searchParams,type='FORMULA_MANAGEMENT#select'){
      objValueIsNull(params)
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(params,type)
      if(type !== 'FORMULA_MANAGEMENT#select'){
        if(res.RETURN.RETURN_MSG === "SUCCESS"){
          this.addFomulaIsVisible(false)
          this.$show.execSuccess()
          this.$emit('initData',false)
        }
        return
      } 
      this.tableOptions.data = getFinallyData(res.DATA,this.timeArr,this.switchArr,this.numberArr,this.searchForm,this.searchParams)
      clearSort.call(this)
      resetData.call(this)
    },
    //重置为初始状态
    resetInitData(){
      this.tableOptions.data = []
      resetData.call(this)
    },
    //准备新增
    toAdd(){
      this.$emit('emitAdd',1)
    },
    //visible展示与隐藏
    addFomulaIsVisible(bool){
      this.addFomulaVisible = bool
    },
    // 编辑
    @getHasPrivTip('C','formula')
    toEdit(index){
      this.opeIndex = index
      this.formula = {...searchRequireParams(this.searchForm,this.searchParams),...this.tableOptions.data[index],formulaValues:[]}
      this.orignalRemark = this.formula.REMARK ? this.formula.REMARK.trim() : ''
      this.addFomulaIsVisible(true)
      if(this.formula.FORMULA_EXP){
        this.formulaEpx(this.formula.FORMULA_EXP,true)
        //  this.getFinalyResult()
        this.$set(this.formula,'result',getFormulaResultNew(this.formula.FORMULA_EXP,this.formula.formulaValues))
      }
    },
    //计算表达式
    formulaEpx(string='',isOriginData=false){
      // 剔除空白符
      string = string.replace(/\s/g, '')
      this.$set(this.formula,'FORMULA_EXP',string)
      this.$set(this.formula,'errorText','')  //格式不正确笼统说法
      if(!/^[A-Z0-9\+\-\*\/\(\)]+$/.test(string)){ // 正则表达式 只能输入数字 大写字母 +-*/()
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error1')) //只能输入数字、大写字母、 +、-、*、/、(、)
        return
      }
      if(!string){ // 错误情况, 空字符串
        this.$set(this.formula,'errorText',this.$t('v_notice_input_formula')) //请输入算法表达式
        return
      }
      if (/^[\+\-\*\/]/.test(string)) { //错误情况, 运算符开始
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error2')) //+、-、*、/、(、)不能作为开始字符
        return
      }
      if (/[\+\-\*\/]$/.test(string)) {  //错误情况, 运算符结尾
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error3')) //+、-、*、/、(、)不能作为结束字符
        return
      }
      if( /[\+\-\*\/]{2,}/.test(string) ){ // 错误情况, 运算符连续
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error4')) //+、-、*、/、(、)不能连续出现
        return
      }
      if(/\(\)/.test(string)){// 空括号
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error5')) //不能输入空括号
        return
      }
      if(/\([\+\-\*\/]/.test(string)){// 错误情况, (后面是运算符 
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error6')) // (后面不能是+、-、*、/
        return
      }
      if(/[\+\-\*\/]\)/.test(string)){// 错误情况, )前面是运算符
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error7')) //)前面不能是+、-、*、/
        return
      }
      if(/[^\+\-\*\/]\(/.test(string)){// 错误情况, (前面不是运算符
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error8')) //(前面不是+、-、*、/
        return
      }
      if(/\)[^\+\-\*\/]/.test(string)){// 错误情况, )后面不是运算符
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error9')) //)后面不是+、-、*、/
        return
      }
      let bracketPrev = []
      let bracketNext = []
      for(let i = 0, item; i < string.length; i++){
        item = string.charAt(i)
        '(' === item && bracketPrev.push(item)
        ')' === item && bracketNext.push(item)
      }
      if(bracketPrev.length !== bracketNext.length){// 错误情况，括号不配对
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_error10')) //括号数目不匹配
        return false
      }
      const numLetters = string.split(/[\+\-\*\/\(\)]/).filter(v=>v)//所有的字母 包括前面的数字
      let numIsOk = true
      for(let b=0;b<numLetters.length;b++){
        if(numLetters[b].length > 1 && /\d/.test(numLetters[b]) && !/\d/.test(numLetters[b].charAt(0))){
          numIsOk = false
          break
        }
      }
      if(!numIsOk){// 表达式中数字在变量中间
        this.$set(this.formula,'errorText',this.$t('v_notice_number_error')) //数字在变量中间
        return false
      }
      if(string.includes("/") && string.split("/")[1] && string.split("/")[1].charAt(0) === '0'){
        this.$set(this.formula,'errorText',this.$t('v_notice_denominator_cannot_be_zero')) 
        return false
      }
      const letters = formulaVariate(string) //所有的字母 不包括数字
      // const values = {}
      const valuesArr = []
      letters.forEach((v,i)=>{
        valuesArr.push({label:v,value:++i})
        // values[v]=++i
      })
      // try{
      //   const fObj = new Formula(string)
      //   fObj.evaluate(values)
      // }catch(err){ 
      //   this.$set(this.formula,'errorText',this.$t('v_notice_formula_format_error'))  //格式不正确笼统说法
      // }
      const formulaValues = this.formula.errorText ? this.formula.formulaValues : valuesArr
      const resultExp = formulaResult(string,formulaValues)
      try{
        eval(resultExp)
      }catch(err){
        this.$set(this.formula,'errorText',this.$t('v_notice_formula_format_error')) 
      }
      !this.formula.errorText && this.$set(this.formula,'formulaValues',formulaValues)
    },
    //验证
    formulaVerify(){
      if(!this.formula.FORMULA_EXP || !this.formula.FORMULA_EXP.trim()){
        this.$show.openWarning(this.$t('v_notice_input_formula'))
        return
      }
      if(this.formula.errorText){
        return
      }
      if(!getFormulaResultNew(this.formula.FORMULA_EXP,this.formula.formulaValues)){
        this.$show.openWarning(this.$t('v_notice_input_formula_value'))
        return
      }
      this.$set(this.formula,'result',getFormulaResultNew(this.formula.FORMULA_EXP,this.formula.formulaValues))
    },
    //获取最终结果 旧的计算方式
    getFinalyResult(){
      const values = {}
      this.formula.formulaValues.forEach(v=>{
        values[v.label] = v.value
      })
      this.$set(this.formula,'result',getFormulaResult(this.formula.FORMULA_EXP,this.formula.formulaValues,values))
    },
    //新增保存
    formulaSubmit(){
      if(this.formula.errorText){
        return
      }
      if(!this.formula.FORMULA_EXP || this.isNeedVerify){
        this.$show.openWarning(this.$t('v_notice_formula_verify_first'))
        return
      }
      this.load(axiosParams([this.formula])[0], this.formula.FORMULA_KEY ? 'FORMULA_MANAGEMENT#update' : 'FORMULA_MANAGEMENT#save')
    },
    // 删除
    @getHasPrivTip('D')
    async toDel(data) {
      const isMutil = data === undefined // 判断是不是单个删除
      if(!isMutil && this.tableOptions.data[data].USE_STATE > 0){
        this.$show.openWarning(this.$t('v_notice_formula_cannot_be_delete'))
        return
      }
      await commonDel(!isMutil ? 1 : this.tableOptions.data.filter(v=>v.checked).length)
      let delIds = isMutil ? this.tableOptions.data.filter(v=>v.checked).map(v=>{return {FORMULA_KEY:+v[this.tableOptions.id],USE_STATE:v.USE_STATE}}) :  {FORMULA_KEY:+this.tableOptions.data[data][this.tableOptions.id],USE_STATE:this.tableOptions.data[data].USE_STATE}
      this.load(delIds, 'FORMULA_MANAGEMENT#delete')
    },
    // 历史
    async toHistory(index){
      this.showHistory = true
      const key = this.tableOptions.id
      this.addFomulaVisible = true
      this.$nextTick(()=>{
        this.$refs.viewHistory.initData({[key]:this.tableOptions.data[index][key]})
      })
    }
  },
  computed:{
    isNeedVerify(){
      return !this.formula.errorText && this.formula.FORMULA_EXP && (!getFormulaResultNew(this.formula.FORMULA_EXP,this.formula.formulaValues) || this.formula.result !== getFormulaResultNew(this.formula.FORMULA_EXP,this.formula.formulaValues))
    }
  },
  watch:{
    height:{
      immediate:true,
      handler(height){
        this.tableOptions.maxHeight = height
      }
    }
  }
}
</script>
