<template>
  <div>
    <BaseTitle :title="$t('v_master_page_change_system_theme')" />
    <div class="color-box m-t-10">
      <div
        :class="['color-item',theme === item ? 'is-ative' : '']"
        v-for="item in themeLists"
        :style="{ background: item }"
        :key="item"
        @click="()=>{theme = item}"
      >
        <span class="el-icon-check"></span>
      </div>
    </div>
  </div>
</template>
<script>
import BaseTitle from "@/component/BaseTitle";
import { themes } from "@/commn/commonFn"
export default {
  components: {
    BaseTitle,
  },
  props:{
    themeColor:''
  },
  data() {
    return {
      theme:this.themeColor,
      themeLists:themes
    }
  }
}
</script>
<style lang="scss" scoped>
.color-box {
  .color-item {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    margin-right: 10px;
    display: inline-block;
    cursor: pointer;
    position: relative;
    .el-icon-check {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-weight: bold;
      display: none;
    }
    &.is-ative {
      .el-icon-check {
        display: block;
      }
    }
  }
}
</style>
