import api from '@/service/api'
import Formula from 'fparser'
import show from '../service/messageBox'
import i18n from './i18n'
import el from 'element-ui'
import { v4 } from 'uuid'
import moment from "moment/moment";

//不用的参数列表
const noUserParams = ['ROW_NUM','CHECK_ALL','CREATE_TIME', 'CREATE_USER', 'EDIT_STATE', 'EDIT_TIME', 'EDIT_USER', 'EVENT', 'EVENT_KEY', 'EVENT_TIME', 'EVENT_USER', 'EVENT_MSG', 'LAST_LOGIN_TIME','ACTION_BAR']
//导入模板时候不用展示值的字段
const importFilterFiled = ['CREATE_TIME','CREATE_USER','EDIT_STATE','EDIT_TIME','EDIT_USER','LAST_LOGIN_TIME','EVENT','EVENT_KEY','EVENT_TIME','EVENT_USER','EVENT_MSG']
// json字符串
const jsonArr = ['COL_TYPE','SEARCH_RENDER_TYPE','COL_DATA_COND','QUERY_PARA_COLS','SEARCH_DATA_COND']
// 大小写区分
const lowerCaseArr = ['CREATE_INPUT_YN','EDIT_ALLOW_YN','BIND_QUERY_TYPE','MANDATORY_YN','SEARCH_MANDATORY_YN','SEARCH_CONTROL_YN','SORT_YN','SAERCH_DISP_YN','COL_HIDDEN_YN','READ_ONLY_YN','KEY_COL_YN']
//颜色集合
const themes = ["#00678e","#ff0000","#ffa500","#FFFF00","#008000","#00FFFF","#0000FF","#800080"]

// 请求参数统一处理
function requeatParams(param = {}, ServiceID = '') {
  let UserID = localStorage.getItem("userId") || ''
  if (ServiceID == 'USERS_MANAGEMENT#login') {
    UserID = param.USER_ID
  }
  const Language = localStorage.getItem("Lang")
  return {
    HEADER: {
      SERVICE_ID: ServiceID,
      FAC_ID: "FB",
      SOURCE_SUBJECT: "NEBULA.R2R.WEB",
      TARGET_SUBJECT: "NEBULA.R2R.API",
      REPLY_SUBJECT: v4(),
      REPLY_TYPE: null,
      REPLY_QUEUE_NAME: null,
      LANGUAGE: Language,
      SYSTEM_ID: "R2R-WEB",
      SYSTEM_VERSION: "1.0.0",
      IP_ADDRESS: null,
      SESSION_ID: null,
      TXN_ID: moment(new Date()).format('yyyy-MM-DD HH:mm:ss.SSS').replaceAll('-','').replaceAll(' ','').replaceAll(':','').replaceAll('.',''),
      EVENT_USER: UserID,
      EVENT_MSG: "WEB REQUEST",
      DATA: []

    },
    BODY: {
      userId: UserID,
      param: param
    },
    RETURN: {
      RETURN_CODE: "",
      RETURN_MSG: ""
    }
  }
}

//获取搜索条件 列表
async function getColMap(condition = {}) {
  const {
    DATA
  } = await api.commn.getColMap(condition)
  return DATA
}

//获取FunctionId
async function getFunctionId(condition = {}) {
  const {
    DATA
  } = await api.systemManagement.getMenu(condition)
  return DATA.length > 0 ? DATA[0] : ''
}

// 获取的数据重置
function resetParams(data = [],isTableColumn=false) {
  return data.map(v => {
    if(isTableColumn){
      lowerCaseArr.forEach(a=>{
        v[a] = v[a] ? v[a].toLowerCase() : v[a]
      })
      jsonArr.forEach(b=>{
        const string = v[b] && v[b].includes("{") && ['COL_TYPE','SEARCH_RENDER_TYPE'].includes(b) ? v[b].toLowerCase() : v[b]
        v[b] = v[b] && v[b].includes("{") ? JSON.parse(string) : {}
      })
    }
    return v
  })
}

// 删除不用的参数
function delParams(data = [],isNeedTrim=false) {
  return data.map(item => {
    for (let key in item) {
      if(isNeedTrim){
        item[key] = Object.prototype.toString.call(item[key]) == "[object String]" ? item[key].trim() : item[key]
      }
      if(noUserParams.includes(key)){//删除入库不用的参数
        delete item[key]
      }
    }
    return item
  })
}

// 接口入参格式统一处理
function axiosParams(data = [], switchArr = [], numberArr = [], specialkeyArr = [],isNeedObjToJSon=true,isNeedTrim=true) {
  let res = switchParams(delParams(data,isNeedTrim), switchArr, numberArr)
  res = isNeedObjToJSon ? objToJson(res) : res
  return resetSelectParam(res, specialkeyArr) // select 选中的参数重置
}

// obj to json
function objToJson(data = []) {
  return data.map(v => {
    jsonArr.forEach(m => {
      if (v[m]) {
        v[m] = JSON.stringify(v[m])
      }
    })
    return v
  })
}

//是否全部禁用
function isDisable(data = [], isDisable = false) {
  return data.map(v => {
    return {
      ...v,
      disabled: isDisable
    }
  })
}


//时间格式
function timeFormat(eventTime = '', format = "YYYY-mm-DD HH:MM:SS.SSS") { //注意 日期中月份需小写  时间中的月份需大写
  const YEAR = eventTime.slice(0, 4)
  const MONTH = eventTime.slice(4, 6)
  const DAY = eventTime.slice(6, 8)
  const HH = eventTime.slice(8, 10)
  const MM = eventTime.slice(10, 12)
  const SS = eventTime.slice(12, 14)
  const MS = eventTime.slice(-3)
  let time = ''
  const hasYear = format.includes('yyyy') || format.includes('YYYY')
  const hasMonth = format.includes('mm')
  const hasDay = format.includes('dd') || format.includes('DD')
  const hasHour = format.includes('hh') || format.includes('HH')
  const hasMinute = format.includes('MM')
  const hasSecond = format.includes('ss') || format.includes('SS')
  const hasMiniSecond = format.includes('sss') || format.includes('SSS')
  time += hasYear ? YEAR : ''
  time += hasMonth ? (hasYear ? '-' + MONTH : MONTH) : ''
  time += hasDay ? (hasMonth ? '-' + DAY : DAY) : ''
  time += hasHour ? (hasDay || hasMonth || hasYear ? ' ' + HH : HH) : ''
  time += hasMinute ? (hasHour ? ':' + MM : MM) : ''
  time += hasSecond ? (hasMinute ? ':' + SS : SS) : ''
  time += hasMiniSecond ? (hasSecond ? '.' + MS : MS) : ''
  return time
}

//计算结果表达式展示
function formulaResult(string = '', replaceArr = []) {
  const letters = string.split(/[\+\-\*\/\(\)]/).filter(v => v) //所有的字母
  // const operates = string.replace(/[A-Za-z0-9]/g,'')//所有的运算符
  const baseOperate = ['+', '-', '*', '/']
  let result = ''
  // let resultExp = ''
  //筛选出所有的运算符 
  let operates = []
  for (let a = 0; a < string.length; a++) {
    if (baseOperate.includes(string[a])) {
      let operateText = ''
      if (a === 0) {
        operateText = string[a + 1] === '(' ? string[a] + string[a + 1] : string[a]
      } else if (a === string.length - 1) {
        operateText = string[a - 1] === ')' ? string[a - 1] + string[a] : string[a]
      } else {
        if (string[a - 1] === ')' && string[a + 1] === '(') {
          operateText = string[a - 1] + string[a] + string[a + 1]
        } else if (string[a - 1] === ')') {
          operateText = string[a - 1] + string[a]
        } else if (string[a + 1] === '(') {
          operateText = string[a] + string[a + 1]
        } else {
          operateText = string[a]
        }
      }
      operates.push(operateText)
    }
  }
  letters.forEach((letter, i) => {
    // let temp = letter
    // if(letter.length !== 1){//省略乘号中间拼接乘号
    //   temp = letter.charAt(0)
    //   for(let o=1;o<letter.length;o++){
    //     temp+='*'+letter[o]
    //   }
    // }
    // result+=temp //字母拼接

    //有数字字母连写  将简写乘法替换成*
    if (/^[\d]+$/.test(letter)) { //纯数字
      result += letter
    } else {
      let nums = ''
      for (let o = 0; o < letter.length; o++) {
        if (!/\d/.test(letter[o])) {
          break
        }
        nums += letter[o]
      }
      const newLetter = nums ? letter.substring(nums.length, letter.length) : letter
      const value = replaceArr.find(v => v.label === newLetter)?.value || ''
      // resultExp += (nums ? letter.substring(0,nums.length) + '*' + letter.substring(nums.length,letter.length): letter)
      result += (nums ? letter.substring(0, nums.length) + '*' + value : value)
    }
    for (let j = 0; j < operates.length; j++) {
      if (j === i) {
        result += operates[j] //运算值拼接
        // resultExp += operates[j] //运算表达式拼接
        break
      }
    }
  })
  result = string.charAt(0) === '(' ? '(' + result : result
  result =  string.charAt(string.length - 1) === ')' ? result + ')' : result
  return result
}

// 筛选出非运算符
function formulaVariate(string = '') {
  const letterPattern = /[a-zA-Z]+/g
  const letters = [...new Set(string.match(letterPattern))] //根据运算符筛选出字母
  // const letters = string.split(/[\+\-\*\/\(\)]/)//所有的字母
  //将连写的字母分开算
  // let onlyLetter = new Array()
  // letters.forEach(letter=>{
  //   if(letter.length !== 1){
  //     for(let index=0;index<letter.length;index++){
  //       onlyLetter.push(letter[index])
  //     }
  //     return
  //   }
  //   onlyLetter.push(letter)
  // })
  // [...new Set(onlyLetter)]
  return letters
}


// 获取计算结果
function getFormulaResult(string = '', replaceArr = [], values = {}) {
  const fObj = new Formula(string)
  const result = fObj.evaluate(values)
  const resultText = formulaResult(string, replaceArr)
  return `${resultText} = ${result}`
}

//获取计算结果(自定义)
function getFormulaResultNew(exp = '', values = []) {
  const isValueEmpty = values.filter(v => !v.value)
  if (isValueEmpty.length > 0) {
    return
  }
  const resultExp = formulaResult(exp, values)
  const result = resultExp ? eval(resultExp) : ''
  return `${resultExp} = ${result ? result.toFixed(2) : ''}`
}

// switch值转换
function switchParams(data = [], ynArr = [], numberArr = []) {
  return data.reduce((prev, v) => {
    const item = {
      ...v
    }
    ynArr.forEach(m => {
      item[m] = item.hasOwnProperty(m) ? (item[m] ? 'Y' : 'N') : 'N'
    })
    numberArr.forEach(m => {
      item[m] = item.hasOwnProperty(m) ? (!isNumberEmpty(item[m]) ? item[m].toString() : (item[m] || null)) : item[m] || null
    })
    prev.push(item)
    return prev
  }, [])
}

// 保存验证必填项是否ok
function validate(columns = [], rules = {}, switchArr = [],isMutil=true) {
  let isValidate = false
  for (let i = 0; i < columns.length; i++) {
    const v = columns[i]
    for (let key in rules) {
      const message = rules[key] && rules[key][0].message
      const isRequired = rules[key] && rules[key][0].required
      if (isRequired && (String(v[key]).trim() === 'null' || String(v[key]).trim() === 'undefined' || String(v[key]).trim() === '') && !switchArr.includes(key)) {
        show.openWarning((isMutil ? (i18n.t('v_notice_data') + (i + 1) + ': ') : '' )+ i18n.t(message) + i18n.t('v_notice_cannot_be_empty'))
        isValidate = true
        break
      }
    }
    if (isValidate) {
      break
    }
  }
  return isValidate
}

//获取下拉框的option
async function getOptions(data, searchParams) {
  const newData = {...data}
  if (!newData.BIND_QUERY_TYPE || !newData.BIND_QUERY_ID) {
    return
  }
  const isServiced = newData.BIND_QUERY_TYPE === 'service'
  const type = isServiced ? newData.BIND_QUERY_ID : `COLMAP_MANAGEMENT#${newData.BIND_QUERY_ID}`
  const dataParams = newData.QUERY_PARA_COLS || {}
  let params = {...(isServiced ? {} : newData),...dataParams,...searchParams}
  params = delParams([params])[0]
  jsonArr.forEach(v => {
    params[v] = v !== 'QUERY_PARA_COLS' ? (params[v] && Object.keys(params[v]).length > 0 ? JSON.stringify(params[v]) : null) : ''
  })
  const {
    modelParaList
  } = api.parameter
  const res = await modelParaList({...params}, type)
  const unique = data.BIND_DISP_COLS && data.BIND_DISP_COLS.split(",").length > 0 && data.BIND_DISP_COLS.split(",")[0] ? data.BIND_DISP_COLS.split(",")[0] : data.BIND_COL_NAME
  const map = new Map();
  //数组去重
  return (res.DATA || []).filter((arr) => !map.has(arr[unique]) && map.set(arr[unique], 1))
}

// table列添select对应的options
async function addSelectOptions(columns = [], searchParams = {}) {
  columns.forEach(async (column) => {
    //判断是不是具有级联关系 ,如果有级联就不加载数据 级联的数据防放在数据触发的时候加载
    const hasCascader = column?.COL_DATA_COND?.COL_CONTROL_YN === 'y' || column?.COL_DATA_COND?.COL_CONTROL_YN === 'Y'
    if (column.COL_TYPE?.name === 'combobox' && !hasCascader) {
      const res = await getOptions(column, searchParams)
      column.COL_TYPE.options = resetParams(res || []).map(v => {
        return {
          ...v,
          label: v[column.BIND_COL_NAME],
          value: v[column.BIND_DISP_COLS ? column.BIND_DISP_COLS.split(",")[0] || column.BIND_COL_NAME : column.BIND_COL_NAME]
        }
      })
    }
  })
  return columns
}

//参数格式化
function formatParam(dataParams, timeArr = [], switchArr = [], numberArr = []) {
  const data = resetParams(dataParams)
  return data.reduce((prev, item) => {
    timeArr.forEach(v => {
      item[v.time] = item[v.time] ? timeFormat(item[v.time], (v.format || undefined)) : item[v.time]
    })
    switchArr.forEach(m => {
      item[m] = item.hasOwnProperty(m) ? item[m] && item[m].toLowerCase() === 'y' : item[m]
    })
    // 这里置为undefined的原因是  ElementUI - el-input-number 中只有值是undefined的时候 才什么也不展示 默认展示为0
    numberArr.forEach(m => {
      item[m] = item.hasOwnProperty(m) ? item[m] === null ? undefined : +item[m] : item[m]
    })
    return prev.concat([item])
  }, [])
}

// columns 单元是否展示
function columnsCellShow(columns = [], searchParams = {},isSearch=false) { // isSearch true  是搜索条件 false 是table
  return columns.reduce((prev, v) => {
    const conditionObj = (isSearch ? v.SEARCH_DATA_COND : v.COL_DATA_COND) || {}
    for (let key in conditionObj) {
      for (let searchKey in searchParams) {
        if (key === searchKey) {
          v.isHidden = !(Object.prototype.toString.call(conditionObj[key]) === '[object Array]' ? conditionObj[key].includes(searchParams[searchKey]) : conditionObj[key] === searchParams[searchKey])
          break
        }
      }
    }
    isSearch ? prev.push(v) : (!v.isHidden && prev.push(v))
    return prev
  }, [])
}

// select 选中的参数重置
function resetSelectParam(data = [], specialkeyArr = []) {
  return data.map(v => {
    specialkeyArr.forEach(m=>{
      const keys = m.BIND_DISP_COLS && m.BIND_DISP_COLS.split(",")
      if(keys && keys.length > 0 ){//有第三方key
        // 从下拉框中找到匹配的值
        let options = []
        if(m.COL_TYPE && m.COL_TYPE.name  === 'combobox'){
          options = m.COL_DATA_COND && (m.COL_DATA_COND.COL_CONTROL_YN === 'y' || m.COL_DATA_COND.COL_CONTROL_YN === 'Y') ? v[m.COL_NAME+"_LIST"] || [] : m.COL_TYPE.options || []
        }
        const findItem = options.find(O => O.value === v[m.COL_NAME] || O.label === v[m.COL_NAME])
        v[m.COL_NAME] = findItem?.label || null
        v[keys[0]] = findItem?.value || null
        if(keys.length > 2){
          v[keys[2]] = findItem?.value || null
        }
      }
    })
    return v
  })
}
// 最大值 最小值 当前值 以及范围检验
function valueValidate(data = [], max = '', min = '', value = '', range = '', lastData = [], key='') {
  let checkOk = true
  for (let i = 0; i < data.length; i++) { //FIX_VALUE FIX_LOWER_LIMIT FIX_UPPER_LIMIT范围内及大小值内验证
    const v = data[i]
    for (let k in v) {
      v[k] = Object.prototype.toString.call(v[k]) == "[object String]" ? v[k].trim() : v[k]
    }
    if ((!isNumberEmpty(v[max]) && isNumberEmpty(v[min])) || (!isNumberEmpty(v[min]) && isNumberEmpty(v[max]))) { // 最大值 和 最小值 同时存在或不存在
      show.openWarning(i18n.t('v_notice_data') + (i + 1) + ': ' + i18n.t('v_notice_placeholder_input') + max + '、' + min)
      checkOk = false
      break
    }
    const filterEditItem = lastData.find(m => m[key] === v[key])
    if (!isNumberEmpty(v[max]) && !isNumberEmpty(v[min])) {
      if (+v[min] > +v[max]) { //最大值大于最小值
        show.openWarning(i18n.t('v_notice_data') + (i + 1) + ': ' + i18n.t('v_notice_max_greater_min'))
        checkOk = false
        break
      }
      if (v[value] && (+v[value] < +v[min] || +v[value] > +v[max])) { //值需在大小值之间
        show.openWarning(i18n.t('v_notice_data') + (i + 1) + ': ' + value + i18n.t('v_notice_input_value_correct'))
        checkOk = false
        break
      }
      if (v[value] && v[range] && filterEditItem && filterEditItem[value] && filterEditItem[value] !== v[value]) { //值在大小值和range范围之间
        const newMax = +v[max] < (+filterEditItem[value] + (+v[range])) ? +v[max] : (+filterEditItem[value] + (+v[range]))
        const newMin = +v[min] > (+filterEditItem[value] - (+v[range])) ? +v[min] : (+filterEditItem[value] - (+v[range]))
        if (+v[value] > newMax || +v[value] < newMin) {
          show.openWarning(i18n.t('v_notice_data') + (i + 1) + ': ' + value + i18n.t('v_notice_input_value_correct_range'))
          checkOk = false
          break
        }
      }
    }
  }
  return checkOk
}

// 获取必填字段的配置
function getRequireSetting(columns) {
  return columns.reduce((prev, item) => {
    if (item?.MANDATORY_YN === 'y') { // 必填检验
      prev[item.COL_NAME] = [{
        required: true,
        message: item.LABEL_ID
      }]
    }
    return prev
  }, {})
}
//字段具有唯一性
function getUnique(data = [], types = []) {
  let isUnique = true
  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      let total = ''
      let nextTotal = ''
      types.forEach(v => {
        total += Object.prototype.toString.call(data[i][v]) == "[object String]" ? data[i][v].trim() : data[i][v]
        nextTotal += Object.prototype.toString.call(data[j][v]) == "[object String]" ? data[j][v].trim() : data[j][v]
      })
      const text = `${i18n.t('v_notice_data')}${i+1}: ${types.join("、")} ${types.length > 1 ? (i18n.t('v_notice_and') + i18n.t('v_notice_is_no_uniqueness')) : i18n.t('v_notice_is_no_uniqueness')}`
      if (total && nextTotal && total === nextTotal) {
        show.openWarning(text)
        isUnique = false
        break
      }
    }
    if (!isUnique) {
      break
    }
  }
  return isUnique
}

// 设置是否勾选
function settingChecked(data, checked) {
  return data.map(v => {
    return {
      ...v,
      checked: v.tableType ? v.checked : checked
    }
  })
}

// 筛选 tabbar button
function filterButton(type = []) {
  let adds = [{
      code: "add",
      name: 'btn_add',
      icon: "fa fa-plus",
      status: "primary"
    },
    {
      code: "copy",
      name: 'btn_copy',
      icon: "el-icon-document-copy",
    },
    {
      code: "save",
      name: 'btn_save',
      icon: "fa fa-save",
      status: type.includes("add") ? 'default' : "primary"
    },
    {
      code: "delete",
      name: 'btn_delete',
      icon: "fa fa-trash-o",
      status: type.length === 1 ? 'primary' : "default"
    },
    {
      code: "cancel",
      name: 'btn_cancel',
      icon: "fa fa-close"
    }
  ]
  adds= adds.map(v=>{
    const find = type.find(m=> Object.prototype.toString.call(m) === '[object Object]' && m.code === v.code) || {}
    return {...v,...find}
  })
  const newTypes = type.map(v => Object.prototype.toString.call(v) === '[object Object]' ? v.code : v)
  return adds.filter(v => newTypes.includes(v.code))
}

// 筛选table action
function filterAction(type = [], actions = []) {
  // const actions = [
  //   { code: "addmenu", title: 'btn_add', icon: "fa fa-plus"},
  //   { code: "detail", title: 'btn_show_detail', icon: "el-icon-view"},
  //   { code: "edit", title: 'btn_edit', icon: "fa fa-edit"},
  //   { code: "del", title: 'btn_delete', icon: "fa fa-trash"},
  //   { code: "history", title: 'btn_view_history', icon: "el-icon-tickets"},
  //   { code: "save", title: 'btn_save', icon: "fa fa-save"},
  //   { code: "cancel", title: 'btn_cancel', icon: "fa fa-close"},
  //   { code: "password", title: 'btn_master_changepwd', icon: "el-icon-lollipop"},
  //   { code: "resetpassword", title: 'btn_reset_password', icon: "el-icon-key"},
  //   { code: "jumpusermenu", title: 'v_priv_user_menu', icon: "el-icon-c-scale-to-original"},
  //   { code: "jumpmenu", title: 'v_priv_menu', icon: "el-icon-c-scale-to-original"},
  //   { code: "jumpuser", title: 'v_priv_user', icon: "el-icon-c-scale-to-original"},
  // ]
  return actions.filter(v => type.includes(v.code))
}

// 折线图数据处理
function filterLineChartDate(data = [], time = '') {
  let dates = []
  let dateObj = {}
  data.forEach(v => {
    const date = timeFormat(v[time], 'mm-DD')
    if (!dates.includes(date)) {
      dates.push(date)
      dateObj[date] = 1
    } else {
      dateObj[date] = dateObj[date] + 1
    }
  })
  return {
    dates,
    dateObj
  }
}

//公共删除
async function commonDel(n) {
  await el.MessageBox.confirm(`${i18n.t("v_confirm_del_confirm")}${n}${i18n.t("v_notice_rows_data")}`, i18n.t("v_confirm_tip"), {
    confirmButtonText: i18n.t("btn_confirm"),
    cancelButtonText: i18n.t("btn_cancel"),
    type: "warning",
  })
  return true
}

// 获取树状结构
function getTree(data = []) {
  let parentCatalog = data.filter(v => v.UPPER_MENU_ID === '0').map(v => {
    return {
      ...v,
      children: [],
      value: v.MENU_ID,
      label: i18n.t(v.LABEL_ID)
    }
  })
  const others = data.filter(v => v.UPPER_MENU_ID !== '0').map(v => {
    return {
      ...v,
      value: v.MENU_ID,
      label: i18n.t(v.LABEL_ID)
    }
  })
  others.forEach(v => {
    const index = parentCatalog.findIndex(m => m.MENU_ID === v.UPPER_MENU_ID)
    index > -1 && parentCatalog[index].children.push(v)
  })
  return parentCatalog
}

// 对象中为空的值置为null
function objValueIsNull(obj) {
  for (let key in obj) {
    obj[key] = obj[key] === undefined || obj[key] === '' ? null : obj[key]
  }
}

//搜索条件配置
async function searchFormSetting(data=[], params={},reserveData=false,isFac=false) {
  data.sort((a, b) => a.COL_DISP_SEQ - b.COL_DISP_SEQ)
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    params[item.COL_NAME] = params[item.COL_NAME] || null
    if (item?.SEARCH_RENDER_TYPE?.name === 'combobox') {
      const lastItem = i !== 0 ? data[i-1] : {}  // 当前项的上一级
      /**
       * 这样处理的原因:
       * 1. 如果table和搜索条件有相同的项 操作完table之后  搜索条件下拉框也要展示刚新增的数据 所以需要刷新搜索条件
       * 2. 如果搜索条件中下拉框 选中了某一项 然后又操作了table 这时候重新请求接口的时候  需要把这个项的搜索条件置空,不然下拉框的数据只是筛选出你刚刚筛选的数据
       * 3. isNeedReset 就表示不是FAC_ID SYS_ID 不是禁用的项  那么请求接口的时候  这个项的值就要置空  当请求下一项的时候  由于级联关系跟上一级值有关 所以就不能置空
       */
      const isNeedReset = (!(item.COL_NAME === 'FAC_ID' || item.COL_NAME === 'SYS_ID' || (item.READ_ONLY_YN === 'y'))) || isFac
      const lastItemHasValue =  params[lastItem.COL_NAME] && params[lastItem.COL_NAME].trim() // 当前项的上一级是否有值
      /**
       * 1 当前项有级联关系并且上一级有值
       * 2 当前项不具有级联关系
       * 3 获取所有的数据
       */
      if((item?.SEARCH_CONTROL_YN === 'y' && lastItemHasValue) || (!item.SEARCH_CONTROL_YN || item.SEARCH_CONTROL_YN === 'n') || reserveData){
        const res = await getOptions(item, {...params,[item.COL_NAME] : isNeedReset ? null : params[item.COL_NAME]})
        item.SEARCH_RENDER_TYPE.options = resetParams(res || []).map(v => {
          return {
            ...v,
            label: v[item.BIND_COL_NAME],
            value: v[item.BIND_DISP_COLS ? item.BIND_DISP_COLS.split(",")[0] || '' : item.BIND_COL_NAME]
          }
        })
        if (item.COL_NAME === 'FAC_ID' || item.COL_NAME === 'SYS_ID') {
          params[item.COL_NAME] = item.SEARCH_RENDER_TYPE.options.length > 0 ? item.SEARCH_RENDER_TYPE.options[0].value : '' // 系统管理需要显示第一个默认值
        } 
      }
    }
  }
  return {
    data,
    params
  }
}

// 搜索条件选择之后 当级之后的数据清空  并当级的下一级请求接口
async function selectChangeSetting(key = '', searchForm = [], searchParams = {}) {
  const findData = searchForm.find(v => v.COL_NAME === key)
  const isNeedCheck = findData?.SEARCH_RENDER_TYPE?.name === 'combobox'
  let newSearchForm = [...searchForm]
  if (isNeedCheck) { //当前操作项是下拉框才做处理
    const findkeySeq = +(searchForm.find(v => v.COL_NAME === key).COL_DISP_SEQ) // 当前key的序号
    newSearchForm = searchForm.map(v => { //搜索条件 下拉框中的数据置空
      const item = {...v}
      const SEARCH_CONTROL_YN = v?.SEARCH_CONTROL_YN === 'y' // 判断是不是有级联关系
      const isNext = +v.COL_DISP_SEQ > findkeySeq // 判断是不是当前项的后面
      const isSelect = v.SEARCH_RENDER_TYPE?.name === 'combobox' || v.SEARCH_RENDER_TYPE?.name === 'cascader'// 当前项是不是下拉框
      if (isNext && SEARCH_CONTROL_YN && isSelect) {
        item.SEARCH_RENDER_TYPE.options = []
      }
      return item
    })
    const nexts = newSearchForm.filter(v => +v.COL_DISP_SEQ > findkeySeq) // 当前项的后面几项
    nexts.forEach(v => { // 当前项的之后的所有项的搜索值置为null
      if(v?.SEARCH_CONTROL_YN === 'y'){
        searchParams[v.COL_NAME] = null
      }
    })
    const findKeyIndex = newSearchForm.findIndex(v => v.COL_NAME === key) // 当前项的index
    let num = 0 // 下一个匹配的有级联关系的select
    for (let i = findKeyIndex + 1; i < newSearchForm.length; i++) {
      const searchItem = newSearchForm[i]
      if (!searchItem.isHidden && searchItem?.SEARCH_CONTROL_YN === 'y' && (searchItem?.SEARCH_RENDER_TYPE?.name === 'combobox' || searchItem?.SEARCH_RENDER_TYPE?.name === 'cascader')) {
        num = i
        break
      }
    }
    if (num > 0 && searchParams[key]) { // 当前项的下面数据中有满足上述条件的 请求数据且上一级有值
      const res = await getOptions(newSearchForm[num], searchParams)
      let concatOptions = resetParams(res || []).map(v => {
        return {
          ...v,
          label: v[newSearchForm[num].BIND_COL_NAME],
          value: v[newSearchForm[num].BIND_DISP_COLS ? newSearchForm[num].BIND_DISP_COLS.split(",")[0] || '' : newSearchForm[num].BIND_COL_NAME]
        }
      })
      newSearchForm[num].SEARCH_RENDER_TYPE.options = concatOptions
    }
  }
  return {
    data: newSearchForm,
    params: searchParams
  }
}

//权限CRUD
function getHasPriv(FUNC_ID, type,opeType) {
  const routers = (sessionStorage.getItem("User") && (JSON.parse(sessionStorage.getItem("User"))?.router)) || []
  const privBtn = (routers.find(v => v.FUNC_ID === FUNC_ID)?.PRIV_BTN_TYPE) || ''
  let hasPriv = true
  if (!opeType && !privBtn.includes(type)) { //没有查询权限
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
    privType.get(type) && privType.get(type)()
  }
  return hasPriv
}

// search rule
function findSearchRules(rule=[]) {
  return rule.reduce((prev, item) => {
    const text = item?.SEARCH_RENDER_TYPE?.name === undefined || item?.SEARCH_RENDER_TYPE?.name === 'input' || item?.SEARCH_RENDER_TYPE?.name === 'textarea' ? 'v_notice_placeholder_input' : 'v_notice_placeholder_select'
    const required = [{
      required: true,
      message: text,
      trigger: 'blur'
    }]
    prev[item.COL_NAME] = required
    return prev
  }, {})
}

//权限顺序
function privSort(privs = []) {
  let priv = ''
  priv += privs.includes("C") ? "C" : "X"
  priv += privs.includes("R") ? "R" : "X"
  priv += privs.includes("U") ? "U" : "X"
  priv += privs.includes("D") ? "D" : "X"
  return priv
}

// 搜索条件重置  fac_id sys_id  已经禁用的不用置为null
function toResetSearch(params = {}, searchForm = []) {
  for (let key in params) {
    const find = searchForm.find(v => v.COL_NAME === key) || {}
    params[key] = key === 'FAC_ID' || key === 'SYS_ID' || (find.READ_ONLY_YN === 'y') ? params[key] : null
  }
}

//获取table的COL_TYPE 分类
function getTableType(column=[]){
  const actions = column.filter(v => v.COL_NAME === 'ACTION_BAR').length > 0 ? column.filter(v => v.COL_NAME === 'ACTION_BAR')[0].COL_TYPE || [] : []
  // 下面需要这个参数的原因: 后端定义的switch类型是字符串 时间类型是20220903083445345 数字类型也是字符串
  const timeArr = column.filter(v=>v?.COL_TYPE?.name === 'date').map(v=>{return{time:v.COL_NAME,format:v.DATA_FORMAT}})
  const switchArr = column.filter(v=>v?.COL_TYPE?.name === 'switch').map(v=>v.COL_NAME )
  const numberArr = column.filter(v=>v?.COL_TYPE?.name === 'number').map(v=>v.COL_NAME )
  const specialkeyArr = column.filter(v=>v?.COL_TYPE?.name === 'combobox')
  return {
    actions,
    timeArr,
    switchArr,
    numberArr,
    specialkeyArr
  }
}

// table级联
async function tableCascader(column = {}, searchParams = {}) {
  const res = await getOptions(column, searchParams)
  return resetParams(res || []).map(v => {
    return {
      ...v,
      label: v[column.BIND_COL_NAME],
      value: v[column.BIND_DISP_COLS ? column.BIND_DISP_COLS.split(",")[0] || column.BIND_COL_NAME : column.BIND_COL_NAME]
    }
  })
}

// 搜索条件时间间隔
async function getSearchLimitTime(params={}){
  const {
    modelParaList
  } = api.parameter
  const res = await modelParaList({...params}, 'ENUMVAL_MANAGEMENT#select')
  return res.DATA && res.DATA.length > 0 && res.DATA[0].ENUM_VAL
}

// Table 只带搜索条件的必填项
function searchRequireParams(searchForm=[],searchParams={}){
  // return searchForm.reduce((prev,item)=>{
  //   if(item?.SEARCH_MANDATORY_YN === 'y'){
  //     prev[item.COL_NAME] = searchParams[item.COL_NAME]
  //   }
  //   return prev
  // },{})
  const oldParams = {}
  for(let key in searchParams){
    if(searchForm.findIndex(v=>v.COL_NAME === key) === -1){
      oldParams[key] = searchParams[key]
    }
  }
  const searchFilterParams = searchForm.reduce((prev,item)=>{
    if(item?.KEY_COL_YN !== 'y'){
      prev[item.COL_NAME] = searchParams[item.COL_NAME]
    }
    return prev
  },{})
  return {...searchFilterParams,...oldParams}
}

//数字类型值是否为空
function isNumberEmpty(value){
  return value === undefined || value === null || value === ''
}

// table 列中获取enum表配置的数据
function getEnumSettingData(columns=[],searchParams={},value=''){
  columns.forEach(async (column) => {
    if (column.COL_TYPE?.name !== 'combobox') {
      const res = await getOptions(column,searchParams)
      if(res){
        column.enumData = value ? res[0][value] : res[0]
      }
    }
  })
  return columns
}
// 初始化默认参数 
function initSearchParam(searchParams={},searchForm=[]){
  const newParams = {...searchParams}
  for(let key in newParams){
    const find = searchForm.find(v => v.COL_NAME === key)
    if(key === 'FAC_ID' || key === 'SYS_ID' || (find.READ_ONLY_YN === 'y')){
      return
    }
    newParams[key] = null
  }
  return newParams
}

// 列表级联数据回显操作
async function colCascaderData(columns,data){
  columns.sort((a, b) => a.COL_DISP_SEQ - b.COL_DISP_SEQ)
  //下拉框具有级联的选项
  const newColumns = columns.filter(v=>{
    return v?.COL_TYPE?.name === 'combobox' && (v?.COL_DATA_COND?.COL_CONTROL_YN === 'y' || v?.COL_DATA_COND?.COL_CONTROL_YN === 'Y')
  })
  for (let i = 0; i < newColumns.length; i++) {
    const item = newColumns[i]
    const currentSeq  = (+item.COL_DISP_SEQ)
    const currentIndex = columns.findIndex(v=>(+v.COL_DISP_SEQ) === currentSeq)
    const lastItem = currentIndex > 0 ? columns[currentIndex-1] || {} : {}  // 当前项的上一级
    if(data[lastItem.COL_NAME]){ // 当前项有级联关系 上一级有值 且允许编辑  才允许调接口
      const res = await getOptions(item, {...data})
      data[item.COL_NAME+'_LIST']  = resetParams(res || []).map(v => {
        return {
          ...v,
          label: v[item.BIND_COL_NAME],
          value: v[item.BIND_DISP_COLS ? item.BIND_DISP_COLS.split(",")[0] || '' : item.BIND_COL_NAME]
        }
      })
    }
  }
  return data
}

//列表下拉框筛选逻辑
async function colSelectChange(key,colColumns,data){
  const findData = colColumns.find(v => v.COL_NAME === key)
  const isNeedCheck = findData?.COL_TYPE?.name === 'combobox'
  if (isNeedCheck) { //当前操作项是下拉框才做处理
    const findkeySeq = +(colColumns.find(v => v.COL_NAME === key).COL_DISP_SEQ) // 当前key的序号
    colColumns.forEach(v => { //搜索条件 下拉框中的数据置空数据数据置空
      const isNext = +v.COL_DISP_SEQ > findkeySeq // 判断是不是当前项的后面
      const COL_CONTROL_YN = v?.COL_DATA_COND?.COL_CONTROL_YN === 'y'|| v?.COL_DATA_COND?.COL_CONTROL_YN === 'Y' // 判断是不是有级联关系
      const isSelect = v.COL_TYPE?.name === 'combobox' || v.COL_TYPE?.name === 'cascader'// 当前项是不是下拉框
      if (isNext && COL_CONTROL_YN && isSelect) {
        data[v.COL_NAME+'_LIST'] = []
        data[v.COL_NAME] = null
      }
    })
    const findKeyIndex = colColumns.findIndex(v => v.COL_NAME === key) // 当前项的index
    const num = colColumns.findIndex((v,i)=>{
      return i > findKeyIndex && v?.COL_DATA_COND.COL_CONTROL_YN === 'y' && v?.COL_TYPE?.name  === 'combobox'
    })
    if (num > 0 && data[key]) { // 当前项的下面数据中有满足上述条件的 请求数据且上一级有值
      const res = await getOptions(colColumns[num], data)
      const concatOptions = resetParams(res || []).map(v => {
        return {
          ...v,
          label: v[colColumns[num].BIND_COL_NAME],
          value: v[colColumns[num].BIND_DISP_COLS ? colColumns[num].BIND_DISP_COLS.split(",")[0] || colColumns[num].BIND_COL_NAME : colColumns[num].BIND_COL_NAME]
        }
      })
      data[colColumns[num].COL_NAME+'_LIST'] = concatOptions
    }
  }
  return data
}

// 最大最小值校验逻辑
function maxMinValidate(columns){
  const validates = ['UPPER_LIMIT','LOWER_LIMIT','MAX','MIN']
  // 筛选所有的最大最小值项
  let hasValidatas = columns.filter(v=>{
    let isHasValidate = false
    for(let i=0;i<validates.length;i++){
      if(v.COL_NAME.includes(validates[i])){
        isHasValidate = true
        break
      }
    }
    return isHasValidate
  }).map(v=>v.COL_NAME)
  //最大最小值名称集合
  let cols = []
  hasValidatas.forEach(a=>{
    validates.forEach(b=>{
      if(a.includes(b)){
        const findIndex = a.indexOf(b)
        cols.push({
          fullName:a,
          name:a.substring(0,findIndex)
        })
      }
    }) 
  })
  const result = []
  for(let i=0;i<cols.length;i++){
    for(let j=i+1;j<cols.length;j++){
      if(cols[j].name === cols[i].name){// 有匹配的最大最小值的项
        result.push(cols[i].fullName.includes('UPPER_LIMIT') || cols[i].fullName.includes('MAX') ? [cols[i].fullName,cols[j].fullName] : [cols[j].fullName,cols[i].fullName])
      }
    }
  }
  // 有设置最大最小值范围的
  const hasRanges = columns.filter(v=>{
    return v?.COL_DATA_COND?.MIN && v?.COL_DATA_COND?.MAX
  }).map(m=>{return {COL_NAME:m.COL_NAME,MAX:m.COL_DATA_COND.MAX,MIN:m.COL_DATA_COND.MIN}})
  result.forEach(outer=>{
    hasRanges.forEach(range=>{
      if(range.MAX === outer[0] && range.MIN === outer[1]){ //最大最小值对应的字段
        outer.push(range.COL_NAME)
      }
    })
  })
  return result
}

//列表数据处理
function getFinallyData(data=[],timeArr=[],switchArr=[],numberArr=[],searchForm=[],searchParams={}){
  return formatParam((data || []),timeArr,switchArr,numberArr).map((v,i)=>{return{...searchRequireParams(searchForm,searchParams),...v,ROW_NUM:i+1}})
}

//重置时候 对应清掉options
function clearSearchOption(searchForm=[],searchParams={}){
  const newSearchForm = [...searchForm]
  // 只针对下拉框 具有级联关系上一级没有值的清空
  let noClears = []
  searchForm.forEach((column,i)=>{
    const isCombobox = column.SEARCH_RENDER_TYPE?.name === 'combobox'
    const hasNoControl = column?.SEARCH_CONTROL_YN !== 'y'
    const specialKey = column.COL_NAME !== 'FAC_ID' || column.COL_NAME !== 'SYS_ID'
    if(specialKey || (isCombobox && hasNoControl)){
      noClears.push(i)
    }
    const hasValue = searchParams[column.COL_NAME]
    const currentSeq = +column.COL_DISP_SEQ
    const nextControls = newSearchForm.filter(v=>(+v.COL_DISP_SEQ > currentSeq) && v.SEARCH_RENDER_TYPE?.name === 'combobox' && v?.SEARCH_CONTROL_YN === 'y')
    const controlItem = nextControls.length > 0 ? nextControls[0] : ""
    hasValue && controlItem && noClears.push(newSearchForm.findIndex(m=>m.COL_NAME === controlItem.COL_NAME))
  })
  return newSearchForm.map((v,i)=>{
    const isNeedClear = noClears.length > 0 ? !noClears.includes(i) :  false
    (v.COL_NAME !== 'FAC_ID' || V.COL_NAME !== 'SYS_ID') && v.SEARCH_RENDER_TYPE?.name === 'combobox' &&  isNeedClear ? v.SEARCH_RENDER_TYPE.options = [] : ''
    return {...v}
  })
}

// 非文本展示类型
function getShowType(column={},data={},type='',showRenderType=false) {
  const isAllowAdd = column?.CREATE_INPUT_YN === 'y' //允许新增
  const isAllowEdit = column?.EDIT_ALLOW_YN === 'y' // 允许编辑
  const isUsedNoEdit = data.USE_STATE && data.USE_STATE > 0 && (column?.COL_DATA_COND?.USED_NO_EDIT === 'y' || column?.COL_DATA_COND?.USED_NO_EDIT === 'Y') // model para被使用过的不让编辑的参数
  const names = ['icon','switch'] //table cell展示和编辑新增展示一样
  const showNames = ['number','input'] // table 上没有编辑的时候  展示渲染类型
  const showType = column?.COL_TYPE?.name 
  if(!data.tableType){// 非新增 编辑展示类
    return names.includes(type) || (showRenderType && showNames.includes(showType)) ? column?.COL_TYPE?.name === type : type === 'text' && !names.includes(column?.COL_TYPE?.name)
  }else{ // 新增编辑展示类
    /**
     * 新增或编辑的时候 字段要允许新增或允许编辑且字段被使用过也可以编辑的 且type类型一致  默认是input框
     * 新增或编辑的时候 不允许新增或不允许编辑或编辑时参数被使用过不让编辑的 类型是文本且不是icon和switch
     */
    return ((data.tableType === 'add' && isAllowAdd) || (data.tableType === 'edit' && isAllowEdit && !isUsedNoEdit)) && (column.COL_TYPE?.name === type  || (type === 'input' && !column.COL_TYPE?.name)) || (
      ((data.tableType === 'add' && !isAllowAdd) || (data.tableType === 'edit' && (!isAllowEdit || isUsedNoEdit))) && type === 'text' && !names.includes(column?.COL_TYPE?.name)
    )
  }
}

//过滤搜索条件中有时间的字段
function filterTimeCol(searchParams={}){
  const times = ['_TIME_BEGIN','_TIME_END']
  const filterTime=[]
  for(let key in searchParams){
    times.forEach(v=>{
      key.includes(v) ? filterTime.push(key) : ''
    })
  }
  return filterTime
}

export {
  requeatParams,
  getColMap,
  resetParams,
  delParams,
  isDisable,
  getFunctionId,
  timeFormat,
  formulaResult,
  formulaVariate,
  getFormulaResult,
  switchParams,
  validate,
  getOptions,
  formatParam,
  columnsCellShow,
  addSelectOptions,
  resetSelectParam,
  axiosParams,
  valueValidate,
  getRequireSetting,
  getUnique,
  filterButton,
  filterAction,
  settingChecked,
  filterLineChartDate,
  getFormulaResultNew,
  commonDel,
  getTree,
  objValueIsNull,
  searchFormSetting,
  selectChangeSetting,
  getHasPriv,
  findSearchRules,
  privSort,
  toResetSearch,
  getTableType,
  importFilterFiled,
  noUserParams,
  tableCascader,
  getSearchLimitTime,
  searchRequireParams,
  getEnumSettingData,
  initSearchParam,
  themes,
  colCascaderData,
  colSelectChange,
  maxMinValidate,
  getFinallyData,
  clearSearchOption,
  getShowType,
  filterTimeCol
}