<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "./layouts/MainLayout.vue";
import BlankLayout from "./layouts/BlankLayout.vue";

const route = useRoute();
const layout = computed(() => {
  return route.meta.layout === "blank" ? BlankLayout : MainLayout;
});
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<style>
/* 移除 FontAwesome 引入 */
</style>
