<template>
  <el-card class="h-full" shadow="never">
    <template #header>
      <div class="flex justify-between items-center">
        <span>分析列表</span>
        <el-button type="primary" @click="handleNewAnalysis">
          <LineChart class="mr-2" :size="16" />
          新建分析
        </el-button>
      </div>
    </template>

    <AnalysisTable :loading="loading" @pageChange="handlePageChange" />
  </el-card>

  <NewAnalysisDialog v-model="dialogVisible" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from "vue";
import AnalysisTable from "./components/AnalysisTable.vue";
import NewAnalysisDialog from "./components/NewAnalysisDialog.vue";

defineOptions({
  name: "Analysis",
});

const loading = ref(false);
const dialogVisible = ref(false);

const handleNewAnalysis = () => {
  dialogVisible.value = true;
};

const handlePageChange = (page) => {
  // TODO: 加載對應頁面的數據
  console.log("Page changed:", page);
};

const handleSubmit = (formData) => {
  // TODO: 提交表單數據
  console.log("Form data:", formData);
};
</script>

<style scoped>
.el-card {
  @apply !border-none;
}

.el-tabs {
  @apply -mx-5;
}
</style>
