<template>
    <span class="title-box">
      <span class="title-line" :style="{background:$root.theme}"></span>
      <span class="title-text" :style="{color:$root.theme}">{{title}}</span>
    </span>
</template>
<script>
export default {
  props:['title']
}
</script>
<style lang="scss" scoped>
.title-box{
  .title-line{
    width: 4px;
    height: 16px;
    background: #00678e;
    margin-right: 6px;
    display: inline-block;
    vertical-align: sub;
  }
  .title-text{
    font-size: 14px;
    font-weight: bold;
    color: #00678e;
  }
}
</style>
