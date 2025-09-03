<template>
  <div>
    <el-form ref="form" :model="colSettingObj" label-width="130px">
      <!-- <el-form-item :label="$t('v_col_setting_is_action_bar')" v-if="!colSettingObj.isSearch">
        <el-checkbox v-model="colSettingObj.HAS_ACTION_BAR" :disabled="getDisabled"/>
      </el-form-item> -->
      <template v-if="!colSettingObj.HAS_ACTION_BAR">
        <el-form-item :label="$t('v_col_setting_col_render_type')" :rules="[{ required: true, trigger:['blur','change']}]">
          <el-radio-group v-model="colSettingObj.HAS_COL_TYPE" :disabled="getDisabled">
            <el-radio
              :label="$t(type.value)"
              :value="type.value"
              :name="type.value"
              v-for="type in colSettingObj.isSearch ? types : [...colTypes,...types]"
              :key="type.value"
              >{{ $t(type.label) }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('v_col_setting_is_add_button')" v-if="!colSettingObj.isSearch">
          <el-checkbox v-model="colSettingObj.HAS_BUTTON" :disabled="getDisabled || !showButton"/>
          <template v-if="colSettingObj.HAS_BUTTON">
            <div>
              <el-checkbox v-model="colSettingObj.HAS_BUTTON_DISPLAY" :disabled="getDisabled">{{
                $t("v_col_setting_button_display")
              }}</el-checkbox>
              <ButtonSetting class="m-l-10" @change="(data)=>{colSettingObj = {...colSettingObj,HAS_DISPICON:{...data}}}" :colButtonObj="colSettingObj.HAS_DISPICON" :getDisabled="getDisabled"/>
            </div>
            <div>
              <el-checkbox v-model="colSettingObj.HAS_BUTTON_EDIT" :disabled="getDisabled">{{
                $t("v_col_setting_button_edit")
              }}</el-checkbox>
              <ButtonSetting class="m-l-10" @change="(data)=>{colSettingObj = {...colSettingObj,HAS_OPEICON:{...data}}}" :colButtonObj="colSettingObj.HAS_OPEICON" :getDisabled="getDisabled"/>
            </div>
          </template>
        </el-form-item>
        <!-- <el-form-item :label="$t('v_col_setting_props_setting')" v-if="colSettingObj.HAS_COL_TYPE === 'combobox'" :rules="[{ required: true, trigger:['blur','change']}]">
          <SelectProps @change="(data)=>{colSettingObj = {...colSettingObj,...data}}" :colSettingProps="colSettingObj"/>
        </el-form-item> -->
        <el-form-item :label="$t('v_col_setting_col_cond_setting')">
          <ColCondData @change="(data)=>{colSettingObj = {...colSettingObj,...data}}" :colCondData="colSettingObj"/>
        </el-form-item>
      </template>
      <template v-if="colSettingObj.HAS_ACTION_BAR">
        <ActionBar @change="getActionBar" :actionBar="colSettingObj.HAS_ACTION_BARS" :getDisabled="getDisabled"/>
      </template>
    </el-form>
  </div>
</template>
<script>
import ButtonSetting from "@/component/ButtonSetting"
import SelectProps from "@/component/SelectProps"
import ColCondData from "@/component/ColCondData"
import ActionBar from "@/component/ActionBar"
export default {
  props:{
    colSettingData:{
      type:Object,
      default:()=>{
        return {}
      }
    }
  },
  components: {
    ButtonSetting,
    SelectProps,
    ColCondData,
    ActionBar
  },
  data() {
    return {
      colTypes:[
        { label: 'v_col_setting_text', value: "text" },
        { label: "v_col_setting_number", value: "number" }
      ],
      types: [
        { label: "v_col_setting_switch", value: "switch" },
        { label: "v_col_setting_input", value: "input" },
        { label: "v_col_setting_textarea", value: "textarea" },
        { label: "v_col_setting_select", value: "combobox" },
        { label: "v_col_setting_date", value: "date" }
      ],
      colSettingObj: {
        HAS_COL_TYPE: "text",
        HAS_ACTION_BAR: false,
        HAS_BUTTON: false,
        HAS_BUTTON_DISPLAY: false,
        HAS_BUTTON_EDIT: false,
        HAS_DISPICON:{},
        HAS_OPEICON:{},
        HAS_ACTION_BARS:[]
      }
    }
  },
  created() {},
  computed: {
    showButton(){
      const buttons = ['text','input','combobox','number']
      return buttons.includes(this.colSettingObj.HAS_COL_TYPE)
    },
    getDisabled(){
      return !(!!this.colSettingObj.tableType)
    }
  },
  methods: {
    confirm(isClear=false) {
      const newParams = {...this.colSettingObj,HAS_DISPICON:{...this.colSettingObj.HAS_DISPICON},HAS_OPEICON:{...this.colSettingObj.HAS_OPEICON}}
      //搜索条件操作
      if(newParams.isSearch){
        const SEARCH_RENDER_TYPE = newParams.HAS_COL_TYPE ? {
          name:newParams.HAS_COL_TYPE
        } : ''
        newParams.SEARCH_RENDER_TYPE = SEARCH_RENDER_TYPE ? JSON.stringify(SEARCH_RENDER_TYPE) : ''
        const SEARCH_DATA_COND = {}
        if( newParams.HAS_AREA_ID && newParams.HAS_AREA_ID.length > 0){
          SEARCH_DATA_COND.AREA_ID = newParams.HAS_AREA_ID
        }
        Object.keys(SEARCH_DATA_COND).length > 0 ? newParams.SEARCH_DATA_COND = JSON.stringify(SEARCH_DATA_COND) : newParams.SEARCH_DATA_COND = null
        !isClear && this.$emit('change',newParams)
        return
      }
      //操作栏操作
      if(newParams.HAS_ACTION_BAR){
        // if(newParams.HAS_ACTION_BARS.length === 0){
        //   this.$show.openWarning(this.$t('v_notice_placeholder_select') + this.$t('v_col_setting_action'))
        //   return
        // }
        if(newParams.HAS_ACTION_BARS.filter(v=>!v.icon || !v.title).length > 0){
          this.$show.openWarning(this.$t('v_col_setting_button_error'))
          return
        }
        !isClear && this.$emit('change',{COL_TYPE:newParams.HAS_ACTION_BARS && newParams.HAS_ACTION_BARS.length > 0 ? JSON.stringify(newParams.HAS_ACTION_BARS) : null})
        return
      }
      //非操作栏操作
      //button 逻辑处理开始
      if(newParams.HAS_BUTTON){
        const settingAll = (!newParams.HAS_BUTTON_DISPLAY && !newParams.HAS_BUTTON_EDIT) // 一个都没有配置
        const settingOne = newParams.HAS_BUTTON_EDIT && !newParams.HAS_BUTTON_DISPLAY //配置编辑操作没有配置展示
        const settingDispaly = newParams.HAS_BUTTON_DISPLAY && (!newParams.HAS_DISPICON.title || !newParams.HAS_DISPICON.icon) // 展示配置后没填写全
        const settingEdit= newParams.HAS_BUTTON_EDIT && (!newParams.HAS_OPEICON.title || !newParams.HAS_OPEICON.icon) // 操作配置后没填写全
        if(settingAll || settingOne || settingDispaly || settingEdit){
          this.$show.openWarning(this.$t('v_col_setting_button_error'))
          return
        }
      }
      if(!newParams.HAS_BUTTON_DISPLAY || !newParams.HAS_BUTTON){
        delete newParams.HAS_DISPICON
      }
      if(!newParams.HAS_BUTTON_EDIT || !newParams.HAS_BUTTON){
        delete newParams.HAS_OPEICON
      }
      //button 逻辑处理结束
      //select 逻辑处理开始
      // if(newParams.HAS_COL_TYPE === 'combobox' && !newParams.BIND_COL_NAME){
      //   this.$show.openWarning(this.$t('v_notice_placeholder_input') + this.$t('v_col_setting_select_show_name'))
      //   return
      // }
      // if(newParams.HAS_COL_TYPE === 'combobox' && !newParams.BIND_QUERY_ID){
      //   this.$show.openWarning(this.$t('v_notice_placeholder_input') + this.$t('v_col_setting_select_interface'))
      //   return
      // }
      // BIND_DISP_COLS
      // let BIND_DISP_COLS = []
      // if(newParams.BIND_DISP_COLS || newParams.HAS_BIND_QUERY_NAME || newParams.HAS_BIND_QUERY_EXTRAl_NAME){
      //   BIND_DISP_COLS.push((newParams.HAS_BIND_QUERY_NAME || ''))
      // }
      // if(newParams.HAS_BIND_TIP_NAME || newParams.HAS_BIND_QUERY_EXTRAl_NAME){
      //   BIND_DISP_COLS.push((newParams.HAS_BIND_TIP_NAME || ''))
      // }
      // newParams.HAS_BIND_QUERY_EXTRAl_NAME && BIND_DISP_COLS.push(newParams.HAS_BIND_QUERY_EXTRAl_NAME)
      // BIND_DISP_COLS = BIND_DISP_COLS.join(",")
      //select 逻辑处理结束
      //列条件控制逻辑处理开始
      if(newParams.HAS_PATTERN && !newParams.HAS_MESSAGE){
        this.$show.openWarning(this.$t('v_notice_placeholder_input') + this.$t('v_col_setting_pattern_message'))
        return
      }
      if(!newParams.HAS_PATTERN){
        newParams.HAS_MESSAGE = '' 
      }
      //列条件控制逻辑处理结束
      // 参数整合
      // COL_TYPE
      let buttons={}
      if(newParams.HAS_BUTTON && newParams.HAS_BUTTON_DISPLAY){
        buttons.dispicon = newParams.HAS_DISPICON
      }
      if(newParams.HAS_BUTTON && newParams.HAS_BUTTON_EDIT){
        buttons.opeicon = newParams.HAS_OPEICON
      }
      let COL_TYPE = newParams.HAS_COL_TYPE ? {
        name:newParams.HAS_COL_TYPE
      } : ''
      if(newParams.HAS_COL_TYPE && Object.keys(buttons).length > 0){
        COL_TYPE.buttons = buttons
      }
      newParams.COL_TYPE = COL_TYPE && Object.keys(COL_TYPE).length > 0 ? JSON.stringify(COL_TYPE) : ''
      //COL_DATA_COND
      let COL_DATA_COND = {}
      if(newParams.HAS_AREA_ID && newParams.HAS_AREA_ID.length > 0){
        COL_DATA_COND.AREA_ID = newParams.HAS_AREA_ID
      }
      if(newParams.HAS_PATTERN){
        COL_DATA_COND.PATTERN = newParams.HAS_PATTERN
      }
      if(newParams.HAS_MESSAGE){
        COL_DATA_COND.MESSAGE = newParams.HAS_MESSAGE
      }
      if(newParams.HAS_MIN){
        COL_DATA_COND.MIN = newParams.HAS_MIN
      }
      if(newParams.HAS_MAX){
        COL_DATA_COND.MAX = newParams.HAS_MAX
      }
      if(newParams.HAS_COL_CONTROL_YN){
        COL_DATA_COND.COL_CONTROL_YN = 'y'
      }
      if(newParams.HAS_USED_NO_EDIT){
        COL_DATA_COND.USED_NO_EDIT = 'y'
      }
      // newParams.BIND_DISP_COLS = BIND_DISP_COLS
      newParams.COL_DATA_COND = Object.keys(COL_DATA_COND).length > 0 ? JSON.stringify(COL_DATA_COND) : ''
      for(let key in newParams){
        key.includes("HAS_") && delete newParams[key]
      }
      !isClear && this.$emit('change',newParams)
    },
    // ActionBar
    getActionBar(data){
      this.colSettingObj.HAS_ACTION_BARS = data.filter(v=>v.checked).map(m=>{return {code:m.value,title:m.title,icon:m.icon}})
    },
    // 一键清空
    clearAll(){
      if(this.colSettingObj.isSearch){//搜索条件
        this.colSettingObj = {
          isSearch:true,
          HAS_COL_TYPE: "",
          HAS_ACTION_BAR: false,
          HAS_AREA_ID:[],
          tableType:this.colSettingObj.tableType
        }
      }else{
        if(this.colSettingObj.HAS_ACTION_BAR){
          this.colSettingObj.HAS_ACTION_BARS = []
        }else{
          this.colSettingObj = {
            isSearch:false,
            HAS_COL_TYPE: "",
            HAS_ACTION_BAR: false,
            HAS_BUTTON: false,
            HAS_BUTTON_DISPLAY: false,
            HAS_BUTTON_EDIT: false,
            HAS_DISPICON:{},
            HAS_OPEICON:{},
            HAS_AREA_ID:[],
            HAS_PATTERN:'',
            HAS_MESSAGE:'',
            HAS_MIN:'',
            HAS_MAX:'',
            HAS_COL_CONTROL_YN:false,
            HAS_USED_NO_EDIT:false,
            tableType:this.colSettingObj.tableType
          }
        }
      }
      this.confirm(true)
    }
  },
  watch:{
    colSettingData:{
      immediate:true,
      deep:true,
      handler(newData){
        this.colSettingObj = {...newData}
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
