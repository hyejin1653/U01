<template>
  <div class="time_box">
    <div>{{ currentDateTime }}</div>
    <div>{{ utcDateTime }}</div>
  </div>
</template>
<script>
export default {
  name: "CurrentDate",
  data: () => ({
    currentDateTime: "KST 2021.02.08 11:00:45",
    utcDateTime: "UTC 2021.02.08 11:00:45",
  }),
  methods: {
    getCurrentDate: function () {
      setInterval(() => {
        let current = new Date();
        let utc = current.toISOString();
        let year = current.getFullYear();
        let month = this.setDateFormat(current.getMonth() + 1);
        let day = this.setDateFormat(current.getDate());
        let hour = this.setDateFormat(current.getHours());
        let min = this.setDateFormat(current.getMinutes());
        let sec = this.setDateFormat(current.getSeconds());
        this.currentDateTime = `KST ${year}.${month}.${day} ${hour}:${min}:${sec}`;

        let currentUTC = utc.replace(/-/gi, ".");
        let blank = " ";
        this.utcDateTime = `UTC ${currentUTC.substring(0,10)}${blank}${currentUTC.substring(11,19)}`;
      }, 1000);
    },
    setDateFormat(val){
      return ("0" + val).slice(-2);
    }
  },
  mounted() {
    this.getCurrentDate();
  },
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap");
.time_box {
  position: absolute;
  z-index: 2;
  top: 90px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: rgb(255, 255, 255);
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 24px;
}
</style>
