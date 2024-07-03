<template>
  <div>
    <div style="height: 45px; text-align: center; font-size: 20px">
      분석결과
    </div>
    <div style="height: 400px">
      <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="10"
        class="elevation-1"
        dense
        item-class="tableStyle"
      ></v-data-table>
    </div>
    <div style="text-align: right">
      <v-btn dark size="xsmall" @click="closeDiv">닫기</v-btn>
    </div>
  </div>
</template>
<script>
export default {
  name: "RouteResult",

  data() {
    return {
      headers: [
        { text: "항로표지명", align: "center", value: "sign_nm" },
        { text: "분석일자", align: "center", value: "base_dt" },
        { text: "민조개", align: "center", value: "minjogae" },
        { text: "홍합", align: "center", value: "honghap" },
        { text: "파래", align: "center", value: "palea" },
        { text: "미역", align: "center", value: "miyeok" },
        { text: "따개비", align: "center", value: "ttagaebi" },
      ],
      items: [],
    };
  },
  mounted() {
    this.searchData();
  },
  methods: {
    searchData() {
      this.$http.get(`/api/ship/routeResultList`).then((res) => {
        console.log(res.data);
        this.items = res.data;
      });
    },
    closeDiv() {
      this.$parent.searchList();
    },
  },
};
</script>
<style>
.tableStyle {
  font-size: 10px;
}
</style>
