<template>
  <div class="nav_left">
    <div class="nav_left_item">
      <a href="./"><img class="logo_image" src="../img/logo.jpg" /></a>
    </div>
    <div class="nav_left_item titlebar">
      <a href="./">
        <span class="logoText1">{{ title1 }}</span>
        <span class="logoText2">{{ title2 }}</span>
      </a>
      <div class="vertext">{{ version }}</div>
    </div>
  </div>
</template>
<script>
import "vue2-datepicker/index.css";
import DatePicker from "vue2-datepicker";

export default {
  components: { DatePicker },
  name: "TitleBar",
  props: ["title1", "title2", "version"],
  data() {
    return {};
  },
  methods: {},
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap");
.nav_left {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  position: absolute;
  z-index: 3;
  padding: 5px 20px;
  top: 10px;
  left: 10px;
  box-shadow: 0 1.5px 3px rgb(0 0 0 / 25%);
  border-radius: 40px;
}
.nav_left .nav_left_item {
  padding-left: 5px;
  padding-right: 5px;
  margin: 0;
  position: relative;
}
.nav_left .titlebar {
  float: left;
  width: 100%;
}
.vertext {
  /* border: 1px solid red; */
  text-align: right;
  padding: 0;
  font-size: 11px;
  position: absolute;
  top: 25px;
  right: 0px;
}
.logo_image {
  width: 50px;
  height: 100%;
}
.logoText1 {
  color: #125080;
}
.logoText2 {
  color: #3597d1;
}
.nav_left .titlebar {
  color: #3597d1;
  font-weight: bold;
  /* font-family: 'Source Sans Pro', sans-serif; */
  font-size: 22px;
  font-weight: bold;
  text-decoration: none;
  font-family: "Nanum Gothic", sans-serif;
}
a {
  text-decoration: none;
}
</style>
