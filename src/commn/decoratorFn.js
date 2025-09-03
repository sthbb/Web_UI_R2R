import { MessageBox, Message } from 'element-ui'
import show from '../service/messageBox'
import i18n from './i18n'
import moment from 'moment'
import { resetData } from '@/commn/comTable'
import { getFunctionId,validate,getRequireSetting,maxMinValidate,axiosParams,valueValidate,commonDel,getUnique,filterTimeCol }   from '@/commn/commonFn'

//二次弹框校验
function confirmTip(content = '', conditionType='',title = i18n.t('v_confirm_tip')) {
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = async function (...args) {
      const newConditionMap = new Map([
        ['USER_STATE',()=>{return (+this.tableOptions.data[args[0]].USE_STATE) > 0}]
      ])
      const isOk = (conditionType && newConditionMap.get(conditionType) && newConditionMap.get(conditionType)()) || !conditionType
      // 条件满足 才执行二次提示或没有条件
      isOk && await MessageBox.confirm(content=i18n.t(content), title=i18n.t(title), {
        type: 'warning',
        confirmButtonText: i18n.t('btn_confirm'),
        concelButtonText:this.$t('btn_cancel')
      })
      originValue.apply(this,args)
    }
    return descriptor
  }
}

//获取权限
function getHasPrivTip(type = 'R',opeType='') {
  let newType = type
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = function (...args) {
      const newOpeTypMap = new Map([
        ['formula',()=> { newType = args[0] !== undefined ? 'U' : 'C'}],
        ['hasModel',()=> { 
          let filterData = Object.prototype.toString.call(args[0]) === '[object Number]' ? [{...this.tableOptions.data[args[0]]}] : this.tableOptions.data.filter(v=>v.tableType)
          newType = filterData[0].tableType === 'add' ? 'C' : 'U'
        }] 
      ])
      const isAddDel = newType === 'D' && Object.prototype.toString.call(args[0]) === '[object Number]' && this.tableOptions.data[args[0]].tableType 
      opeType && newOpeTypMap.get(opeType) && newOpeTypMap.get(opeType)()
      const routers = (sessionStorage.getItem("User") && (JSON.parse(sessionStorage.getItem("User"))?.router)) || []
      const privBtn = (routers.find(v => v.FUNC_ID === this.FUNC_ID)?.PRIV_BTN_TYPE) || ''
      let hasPriv = true
      if (!isAddDel && !privBtn.includes(newType)) { //没有查询权限
        hasPriv = false
        const privType = new Map([
          ['C', () => {
            show.openWarning(i18n.t('v_notice_have_no_c_priv'))
          }],
          ['R', () => {
            show.openWarning(i18n.t('v_notice_have_no_r_priv'))
          }],
          ['U', () => {
            show.openWarning(i18n.t('v_notice_have_no_u_priv'))
          }],
          ['D', () => {
            show.openWarning(i18n.t('v_notice_have_no_d_priv'))
          }],
        ])
        privType.get(newType) && privType.get(newType)()
      }
      return hasPriv && originValue.apply(this,args)
    }
    return descriptor
  }
}

//获取func_id
function getFuncID(VIEW_URL){
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = async function (...args) {
      if(!this.FUNC_ID){
        const {FUNC_ID,LABEL_ID} = await getFunctionId({VIEW_URL})
        this.FUNC_ID = FUNC_ID
        this.tableOptions ? this.tableOptions.exportTitle = LABEL_ID : this.title = LABEL_ID
      }
      originValue.apply(this,args)
    }
    return descriptor
  }
}


//列表上新增 刷新 搜索条件必填项校验
function addValidate(){
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = async function (...args) {
      let res = false
      try{
        res = await this.$refs?.searchRef?.$refs[this.$refs.searchRef.searchRef].validate()
      }catch(err){
        this.isCollapse = false
      }
      res && originValue.apply(this,args)
    }
    return descriptor
  }
}

//保存条件检验
function saveValidate(type = ''){
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = async function (...args) {
      const isNumber = Object.prototype.toString.call(args[0]) === '[object Number]'
      const editRules = getRequireSetting(this.tableOptions.columns)
      const filterData = !isNumber ? this.tableOptions.data.filter(v=>v.tableType) : [{...this.tableOptions.data[args[0]]}]
      let checkOk = true  
      if(validate(filterData,editRules,this.switchArr,!isNumber)){
        return
      }
      const checkArr = maxMinValidate(this.tableOptions.columns)
      checkArr.forEach(checkItem =>{
        checkOk = checkOk && valueValidate(filterData,...checkItem)
      })
      const types = new Map([
        [1,()=>{
          checkOk = checkOk && getUnique(this.tableOptions.data,['PROD_ID','FLOW_ID','OPER_ID','MEAS_OPER_ID','REF_PARA'])
          checkOk = checkOk && getUnique(this.tableOptions.data,['PROD_ID','FLOW_ID','OPER_ID','REF_ALIAS'])
        }],
        [2,()=>{
          checkOk = checkOk && getUnique(this.tableOptions.data,['PROD_ID','FLOW_ID','OPER_ID','DCOL_OPER_ID','DCOL_PARA'])
        }],
        [3,()=>{
          checkOk = checkOk && getUnique(this.tableOptions.data,['PROD_ID','FLOW_ID','OPER_ID','MEAS_OPER_ID','REF_PARA'])
        checkOk = checkOk && getUnique(this.tableOptions.data,['PROD_ID','FLOW_ID','OPER_ID','REF_ALIAS'])
        }]
      ])
      type && types.get(type) && types.get(type)()
      checkOk && originValue.apply(this,args)
    }
    return descriptor
  }
}

//删除验证
function deleteValidata(){
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = async function (...args) {
      const isNumber = Object.prototype.toString.call(args[0]) === '[object Number]'
      const isAddDel = isNumber && this.tableOptions.data[args[0]].tableType // 判断是不是单条新增
      !isAddDel && await commonDel(isAddDel || isNumber ? 1 : this.tableOptions.data.filter(v=>v.checked).length)
      if(isAddDel){//新增删除
        this.tableOptions.data.splice(args[0],1)
        this.tableOptions.data.filter(v=>v.tableType).length === 0 && resetData.call(this) //没有删除 数据重置
        return
      }
      originValue.apply(this,args)
    }
    return descriptor
  }
}
//搜索验证
function searchValidata(){
  return function (target, name, descriptor) {
    const originValue = descriptor.value
    descriptor.value = async function (...args) {
      const times = filterTimeCol(this.searchParams) 
      if(times && times.length === 2){
        const begin = times[0]
        const end = times[1]
        const limitTime = this.limitTime || 7
        this.searchParams = {...this.searchParams,...args[0]}
        this.searchParams[begin] = this.searchParams[begin] ? moment(this.searchParams[begin]).format('YYYY-MM-DD HH:mm:ss') : null 
        this.searchParams[end] = this.searchParams[end] ? moment(this.searchParams[end]).format('YYYY-MM-DD HH:mm:ss') : null
        const newDate = new Date(moment(this.searchParams[begin]).format('YYYY-MM-DD 00:00:00')).getTime()
        const endDate = new Date(moment(this.searchParams[end]).format('YYYY-MM-DD 00:00:00')).getTime()
        if(newDate > endDate){
          this.$show.openWarning(this.$t('v_notice_begin_less_than_endhan_end'))
          return
        }
        if((endDate - newDate) >= +limitTime*24*60*60*1000){
          this.$show.openWarning(this.$t('v_notice_time_interval') + limitTime + this.$t('v_notice_day'))
          return
        }
      }
      originValue.apply(this,args)
    }
    return descriptor
  }
}

export { confirmTip, getHasPrivTip, getFuncID, addValidate,saveValidate,deleteValidata,searchValidata }