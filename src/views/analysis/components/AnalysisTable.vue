<template>
  <div class="analysis-table">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="進行中" name="processing">
        <el-table
          :data="processingData"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="name" label="分析名稱" />
          <el-table-column prop="type" label="分析類型" width="180" />
          <el-table-column prop="progress" label="進度" width="200">
            <template #default="scope">
              <el-progress :percentage="scope.row.progress" />
            </template>
          </el-table-column>
          <el-table-column prop="date" label="創建時間" width="180" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" link>
                  <Eye :size="16" />
                </el-button>
                <el-button type="danger" link>
                  <Trash :size="16" />
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="已完成" name="completed">
        <el-table :data="completedData" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="分析名稱" />
          <el-table-column prop="type" label="分析類型" width="180" />
          <el-table-column prop="result" label="結果" width="180" />
          <el-table-column prop="date" label="完成時間" width="180" />
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" link>
                  <Eye :size="16" />
                </el-button>
                <el-button type="success" link>
                  <Download :size="16" />
                </el-button>
                <el-button type="danger" link>
                  <Trash :size="16" />
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <div class="flex justify-center mt-4" v-if="noData">
      <el-empty description="暫無分析數據" />
    </div>
    <el-pagination
      v-if="!noData"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
      class="mt-4 flex justify-end"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["pageChange"]);

const activeTab = ref("processing");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 模擬數據
const processingData = ref([
  {
    name: "製程A良率分析",
    type: "相關性分析",
    progress: 45,
    date: "2024-02-06 10:30",
  },
]);

const completedData = ref([
  {
    name: "製程B良率分析",
    type: "回歸分析",
    result: "已完成",
    date: "2024-02-05 15:20",
  },
]);

const noData = computed(() => {
  return activeTab.value === "processing"
    ? processingData.value.length === 0
    : completedData.value.length === 0;
});

const handlePageChange = (page) => {
  currentPage.value = page;
  emit("pageChange", page);
};
</script>
