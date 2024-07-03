<template>
  <button class="gc-style" @click="menuClick()">
    {{ data.title }}
    <font-awesome-icon :icon="data.icon" class="icon alt" />
  </button>
</template>
<script>
export default {
  name: "MenuBar",
  props: ["data"],
  data: () => ({
    menus: [
      { title: "Upload", icon: ["fas", "angry"] },
      { title: "Download", icon: ["fas", "sign-out-alt"] },
    ],
  }),
  methods: {
    menuClick()
    {
      this.$emit('click', this.data.title);
    }
  }
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap");
.gc-style {
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
.gc-style:hover {
  background-color: #f7ac4b;
  color: #fff;
  cursor: pointer;
}
</style>
