<template>
  <div class="tabs-box">
    <div class="tabs-contain">
      <div
        class="tab-item"
        :style="{background: item.name === activeTab ? $root.theme:'#fff',color : item.name === activeTab ?'#fff' : '#303133'}"
        v-for="item in tabs"
        :key="item.name"
        @click="() => { $emit('childEmit', item.name)}"
      >
        {{ $t(item.label) }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tabs: {
      type: Array,
      default: () => {
        return [];
      },
    },
    activeTab: {
      type: String | Number,
      default: "",
    },
  },
  data() {
    return {};
  },
  created() {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.tabs-box{
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid #e4e7ed;
}
.tabs-contain {
  font-size: 12px;
  color: #303133;
  width: max-content;
  .tab-item {
    padding: 0 20px;
    height: 30px;
    line-height: 30px;
    display: inline-block;
    border-left: 1px solid #e4e7ed;
    border-top: 1px solid #e4e7ed;
    cursor: pointer;
    &:first-child {
      border-radius: 4px 0 0 0;
    }
    &:last-child {
      border-right: 1px solid #e4e7ed;
      border-radius: 0 4px 0 0;
    }
  }
}
</style>
