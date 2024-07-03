<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    //
  }),
};
</script>
<style>
.app {
  position: relative;
}
.nav_left_item {
  /* border: 1px solid red; */
  padding-left: 5px;
  padding-right: 5px;
  margin: 0;
  position: relative;
}
.title {
  display: block;
  /* border: 1px solid red; */
  width: 100vw;
  /* border: 1px solid red; */
}
.logoText1 {
  color: white;
}
.logoText2 {
  color: white;
}
html {
  overflow-y: hidden !important;
}
.gc-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: #bad6f2;
}

.gc-scrollbar::-webkit-scrollbar-thumb {
  background-color: #6699cc;
}

.gc-scrollbar::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
  background-color: #d3e2f1;
}
.gc-scrollbar::-webkit-scrollbar-thumb {
  /* 스크롤 막대 색상 */
  background-color: #6699cc;
}

.gc-scrollbar::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
  /* 스크롤바 트랙 색상 */
  background-color: #d3e2f1;
}
</style>
