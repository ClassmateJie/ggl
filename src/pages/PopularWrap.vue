<script setup lang="ts">
</script>

<template>
  <div class="color-wrap">
    <div class="logo">
      <a>小林子的刮刮乐</a>
    </div>
    <div class="color-wrap-content">
      <p>这是什么？惊喜还是意外，bug 还是蒋杰的精心设计？小林子，刮刮看。</p>
    </div>
  </div>
</template>

<style lang="less">
.color-wrap {
  width: 100%;
  height: 100%;

  &-content {
    padding-top: 10px;
    font-size: 16px;
    margin: 0 auto;
    p {
      line-height: 32px;
    }
  }

  .logo {
    position: relative;
    height: 48px;
    line-height: 48px;
    padding: 0 15px;
    text-align: center;
    a {
      width: 220px;
      padding-left: 24px;
      font-size: 30px;
      color: #F4F4E6;
    }
  }
}
</style>