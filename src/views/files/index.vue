<template>
  <el-card class="h-full" shadow="never">
    <template #header>
      <div class="flex justify-between items-center">
        <span>文件列表</span>
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
        >
          <el-button type="primary">
            <Upload class="mr-2" :size="16" />
            上傳文件
          </el-button>
        </el-upload>
      </div>
    </template>

    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="文件名稱" />
      <el-table-column prop="size" label="大小" width="180" />
      <el-table-column prop="date" label="上傳時間" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button-group>
            <el-button type="primary" link>
              <Download :size="16" />
            </el-button>
            <el-button type="danger" link>
              <Trash :size="16" />
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center mt-4" v-if="tableData.length === 0">
      <el-empty description="暫無文件" />
    </div>

    <template #footer>
      <el-pagination
        v-if="tableData.length > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        class="mt-4 flex justify-end"
      />
    </template>
  </el-card>
</template>

<script setup>
import { ref } from "vue";

defineOptions({
  name: "Files",
});

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);

const handleFileChange = (file) => {
  // TODO: 處理文件上傳
  console.log("Selected file:", file);
};

const handlePageChange = (page) => {
  currentPage.value = page;
  // TODO: 加載對應頁面的數據
};
</script>

<style scoped>
.el-card {
  @apply !border-none;
}
</style>
