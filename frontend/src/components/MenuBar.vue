<template>
  <div class="text-center menu-bar">
    <button class="gc-style" @click="searchList">분석결과</button>
    <input
      class="select-style2"
      placeholder="해역"
      v-model="selectedArea"
      @click="clearArea"
      @change="changeArea"
      type="text"
      list="areaL"
    />
    <datalist id="areaL">
      <option v-for="(area, index) in areaList" :key="index">
        {{ area.AREA_NM }}
      </option>
    </datalist>
    <input
      class="select-style"
      placeholder="항로표지명"
      v-model="selectedSign"
      @click="clearInput"
      type="text"
      list="sign"
    />
    <datalist id="sign">
      <option v-for="(sign, index) in signList" :key="index">
        {{ sign.SIGN_NM }}
      </option>
    </datalist>
    <!-- <button class="gc-style" @click="moveToSign">
      이동
      <font-awesome-icon icon="fa-solid fa-plane" />
    </button> -->
  </div>
</template>
<script>
import $ from "jquery";
import GcButton1 from "@/components/Control/GcButton1";

export default {
  name: "MenuBar",
  components: {
    GcButton1,
  },
  props: ["resultSign"],
  data() {
    return {
      signList: [],
      selectedSign: "",
      selectedArea: "",
      areaList: [{ AREA_NM: "동해" }, { AREA_NM: "서해" }, { AREA_NM: "남해" }],
    };
  },
  watch: {
    selectedSign(val) {
      this.moveToSign();
    },
  },
  mounted() {
    //console.log('dd', this.resultSign)
    this.signList = this.resultSign;
    if (this.selectedArea == "") return;
  },
  methods: {
    changeArea() {
      //console.log(this.selectedArea, this.resultSign);
      let area = this.selectedArea;
      let resultDt = this.resultSign
        .filter(function (e) {
          return e.AREA == area;
        })
        .map(function (e) {
          return e;
        });
      this.signList = resultDt;
      //console.log(this.signList);
    },
    moveToSign() {
      //console.log(this.selectedSign);
      if (this.selectedSign === "") return;
      this.$parent.moveToSign(this.selectedSign);
    },
    clearArea() {
      if (this.selectedArea == "") return;
      //console.log(this.selectedArea);
      this.selectedArea = "";
    },
    clearInput() {
      if (this.selectedSign == "") return;
      //console.log(this.selectedSign);
      this.selectedSign = "";
    },
    searchList() {
      this.$parent.searchList();
    },
  },
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap");
.menu-bar {
  position: absolute;
  z-index: 2;
  right: 50px;
  top: 20px;
}
.select-style {
  height: 100px;
  border-radius: 50px;
  background: #fff;
  margin: 8px;
  padding: 10px 12px;
  box-shadow: 0 1.5px 3px rgb(0 0 0 / 25%);
  height: 35px;
  color: #3697d1;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  font-family: "Nanum Gothic", sans-serif;
  font-size: 12px;
}
.select-style:hover {
  background-color: #fff;
  cursor: pointer;
}
.select-style2 {
  height: 100px;
  width: 80px;
  border-radius: 50px;
  background: #fff;
  margin: 8px;
  padding: 10px 12px;
  box-shadow: 0 1.5px 3px rgb(0 0 0 / 25%);
  height: 35px;
  color: #3697d1;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  font-family: "Nanum Gothic", sans-serif;
  font-size: 12px;
}
.select-style2:hover {
  background-color: #fff;
  cursor: pointer;
}
</style>
