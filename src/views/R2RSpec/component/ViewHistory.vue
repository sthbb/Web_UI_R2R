<template>
  <div>
    <div class="flex-box m-b-10" v-if="showSearch">
      <span class="m-r-10">{{$t('v_history_time')}}</span>
      <el-date-picker
        v-model="time"
        type="datetimerange"
        :start-placeholder="$t('v_history_begin_time')"
        :end-placeholder="$t('v_history_end_time')"
        :default-time="['00:00:00','23:59:59']"
        format="yyyy-MM-dd HH:mm:ss"
      />
      <el-button type="primary" class="m-l-10" @click="toSearch">{{$t('btn_search')}}</el-button>
    </div>
    <BaseTable :tableOptions="baseProps" :viewHistory="true" @handleTableChange="handleTableChange"/>
  </div>
</template>
<script>
import BaseTable from "@/component/BaseTable"
import BaseSearch from "@/component/BaseSearch"
import { getSearchLimitTime, formatParam } from '@/commn/commonFn'
import moment from 'moment'
export default {
  components: {
    BaseTable,
    BaseSearch
  },
  props: {
    api:{
      type:String,
      default:''
    },
    timeArr:{
      type:Array,
      default:()=>{return []}
    },
    switchArr:{
      type:Array,
      default:()=>{return []}
    },
    columns:{
      type:Array,
      default:()=>{return []}
    },
    showSearch:{
      type:Boolean,
      default:()=>{return false}
    },
    showPage:{
      type:Boolean,
      default:()=>{return false}
    }
  },
  data() {
    return {
      searchParams:{
        PAGE_NUM: 1,
        PAGE_SIZE: 10,
        PAGINATION:true,
        EDIT_TIME_BEGIN:'',
        EDIT_TIME_END:''
      },
      baseProps:{
        maxHeight:400,
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
        data:[],
        pagerConfig:{
          TOTAL: 0,
          PAGE_NUM: 1,
          PAGE_SIZE: 10,
          PAGINATION:this.showPage || false
        }
      },
      limitTime:7,
      time:[]
    }
  },
  computed: {},
  methods: {
    // 获取时间
    async getTime(){
      this.limitTime = +(await getSearchLimitTime({ENUM_ID:'SEARCH_PERIOD_CURRENT_PARA',FAC_ID:this.searchParams.FAC_ID}) || '7')
      const startTime = moment(new Date()).subtract('days',this.limitTime - 1).format('YYYY-MM-DD 00:00:00')
      const endTime = moment(new Date()).format("YYYY-MM-DD 23:59:59")
      this.searchParams.EDIT_TIME_BEGIN = startTime
      this.searchParams.EDIT_TIME_END = endTime
      this.time = [startTime,endTime]
    },
    // 查询
    toSearch(){
      this.searchParams.EDIT_TIME_BEGIN = this.time && this.time.length > 0 ? this.time[0] : null
      this.searchParams.EDIT_TIME_END = this.time && this.time.length > 0 ? this.time[1] : null
      const newDate = new Date(moment(this.searchParams.EDIT_TIME_BEGIN).format('YYYY-MM-DD 00:00:00')).getTime()
      const endDate = new Date(moment(this.searchParams.EDIT_TIME_END).format('YYYY-MM-DD 00:00:00')).getTime()
      if(newDate > endDate){
        this.$show.openWarning(this.$t('v_notice_begin_less_than_endhan_end'))
        return
      }
      if((endDate - newDate) >= +this.limitTime*24*60*60*1000){
        this.$show.openWarning(this.$t('v_notice_time_interval') + this.limitTime + this.$t('v_notice_day'))
        return
      }
      this.searchParams = {...this.searchParams,PAGE_NUM:1}
      this.baseProps.pagerConfig = {...this.baseProps.pagerConfig,PAGE_NUM:1}
      this.getData()
    },
    // 初始化
    async initData(params={}){
      await this.getTime()
      this.getData(params)
    },
    // 获取数据
    async getData(data={}){
      this.searchParams.EDIT_TIME_BEGIN = this.searchParams.EDIT_TIME_BEGIN ? moment(this.searchParams.EDIT_TIME_BEGIN).format('YYYY-MM-DD HH:mm:ss') : null
      this.searchParams.EDIT_TIME_END = this.searchParams.EDIT_TIME_END ? moment(this.searchParams.EDIT_TIME_END).format('YYYY-MM-DD HH:mm:ss') : null
      this.searchParams = {...this.searchParams,...data}
      const { modelParaList } = this.$api.parameter
      const res  = await modelParaList(this.searchParams,this.api)
      this.baseProps.pagerConfig.TOTAL = res?.TOTAL_COUNT || 0
      this.baseProps.data = formatParam((res.DATA||[]),this.timeArr,this.switchArr,[]).map((v,i)=>{return {...v,ROW_NUM:i+1}})
      this.baseProps.columns = this.columns.slice(this.columns.findIndex(v=>v.COL_NAME === 'CHECK_ALL') === -1 ? 0 : 1,this.columns.findIndex(v=>v.COL_NAME === 'ACTION_BAR') === -1 ? this.columns.length : this.columns.length - 1).filter(v=>v.COL_NAME !== 'USE_STATE')
    },
    // table操作
    handleTableChange(data){
      const tableType = new Map([
        ["page",() => {
          this.searchParams = {...this.searchParams,...data.data}
          this.baseProps.pagerConfig = {...this.baseProps.pagerConfig,...data.data}
          this.getData()
        }]
      ])
      return tableType.get(data.type) && tableType.get(data.type)()
    }
  },
  watch:{}
}
</script>
<style lang="scss" scoped>
/deep/ .el-date-editor{
  width: 320px !important;
  .el-range-input{
    font-size: 12px;
  }
  .el-range__icon, .el-range-separator, .el-range__close-icon{
    line-height: 22px !important;
  }
}
</style>
