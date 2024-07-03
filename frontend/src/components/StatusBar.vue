<template>
  <div class="status_box">
    <div class="left">Level : {{ level }}</div>
    <div class="center">
      <span style="color: #00cbff" class="tbold">E </span>{{ WGS84_Pos.HDMS_long }}
      <span style="color: #ff5131" class="tbold">N </span>{{ WGS84_Pos.HDMS_lat }}
      <span>({{ WGS84_Pos.long }}, {{ WGS84_Pos.lat }})</span>
    </div>
    <div class="rignt">
      <img
        class="logo_image"
        src="../assets/GC_Signature_negative_face.png"
        style="width: 32px; hight: auto; vertical-align: middle"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: "StatusBar",
  props: ["zoom", "WGS84_Pos"],
  data: () => ({}),
  computed: {
    level() {
      return Math.round(parseFloat(this.zoom) * 10) / 10;
    },
  }
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap");
.status_box {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  position: absolute;
  width: 100%;
  bottom: 0px;
  color: #fff;
  font-family: "Nanum Gothic", sans-serif;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
}
.center {
  text-align: left;
  width: 340px;
}
.tbold {
  font-weight: bold;
}
</style>
