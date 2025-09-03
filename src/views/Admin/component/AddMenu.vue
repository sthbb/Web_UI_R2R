<template>
  <div class="menu-contain font-12">
    <div class="m-b-18">
      <span class="m-r-20">
        <span class="require-text">*</span>
        {{treeData.isPriv ? $t('v_dialog_title_priv') : $t('v_dialog_title_user')}}
      </span>
      <el-select v-model="treeData.privData.PRIV_ID" :placeholder="$t('v_notice_select_priv')" class="m-r-20" :disabled="(searchParams.PRIV_ID ? true : false)" v-if="treeData.isPriv" @change="selectPriv">
        <el-option
          v-for="item in treeData.privList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="treeData.privData.USER_ID" :placeholder="$t('v_notice_select_user')" class="m-r-20" :disabled="(searchParams.USER_ID ? true : false)" v-else @change="selectPriv">
        <el-option
          v-for="item in treeData.privList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <span class="m-r-20">{{$t('c_priv_btn_type')}}</span>
      <el-select v-model="treeData.privData.PRIV_BTN_TYPE" multiple :placeholder="$t('v_notice_select_button_priv')" :class="['m-r-20','priv-type']">
        <el-option
          v-for="item in privSettingLists"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <el-tree
      :data="treeData.menuList"
      show-checkbox
      :node-key="nodeKey"
      :default-expanded-keys="treeData.expendKeys"
      :default-checked-keys="treeData.checkKeys"
      :props="defaultProps"
      ref="tree"
      highlight-current
    >
    <span class="span-ellipsis" slot-scope="{ node }">
      <span :title="node.label" :class="['one-line']" :style="{color:node.data.hasExit ? 'red' : '#000'}">{{
        node.label
      }}</span>
    </span>
  </el-tree>
  </div>
</template>
<script>
export default {
  props:{
    treeData:{
      type:Object,
      default:()=>{return {
        menuList:[],
        expendKeys:[],
        checkKeys:[],
        privList:[],
        isPriv:true
      }}
    },
    nodeKey:{
      type:String,
      default:'ID'
    },
    searchParams:{
      type:Object,
      default:()=>{return {}}
    },
    defaultProps:{
      type:Object,
      default:()=>{return {label:'label',children:'children'}}
    },
    privSettingLists:{
      type:Array,
      default:()=>{return []}
    }
  },
  data() {
    return {}
  },
  created() {},
  computed: {},
  methods: {
    selectPriv(data){
      this.$emit('selectPriv',data)
    }
  }
}
</script>
<style lang="scss" scoped>
.menu-contain{
  border:1px solid #ececec;
  border-radius: 10px;
  padding: 20px;
  max-height: 800px;
  overflow-y: auto;
}
.priv-type.el-select{
  width: 430px;
}
</style>
