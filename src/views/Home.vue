<template>
  <div class="container mx-auto p-4">
    <el-row :gutter="20">
      <!-- 歡迎卡片 -->
      <el-col :span="24" class="mb-4">
        <el-card class="welcome-card">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2">
                歡迎回來，{{ userInfo.username }}
              </h2>
              <p class="text-gray-600">
                今天是 {{ currentDate }}，祝您有個美好的一天！
              </p>
            </div>
            <el-button type="primary" @click="handleCreateProject">
              <el-icon class="mr-1"><Plus /></el-icon>
              新增專案
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 統計卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-blue-500"><Folder /></el-icon>
              專案總數
            </div>
          </template>
          <div class="text-2xl font-bold">12</div>
          <div class="text-sm text-gray-500">較上月 +2</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-green-500"><Document /></el-icon>
              檔案總數
            </div>
          </template>
          <div class="text-2xl font-bold">156</div>
          <div class="text-sm text-gray-500">較上月 +23</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-yellow-500"><Connection /></el-icon>
              工作流程
            </div>
          </template>
          <div class="text-2xl font-bold">8</div>
          <div class="text-sm text-gray-500">較上月 +1</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-purple-500"><User /></el-icon>
              團隊成員
            </div>
          </template>
          <div class="text-2xl font-bold">24</div>
          <div class="text-sm text-gray-500">較上月 +3</div>
        </el-card>
      </el-col>

      <!-- 最近專案 -->
      <el-col :span="16" class="mt-4">
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span>最近專案</span>
              <el-button text>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentProjects" style="width: 100%">
            <el-table-column prop="name" label="專案名稱" />
            <el-table-column prop="status" label="狀態">
              <template #default="{ row }">
                <el-tag :type="row.status === '進行中' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="最後更新" width="180" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 待辦事項 -->
      <el-col :span="8" class="mt-4">
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span>待辦事項</span>
              <el-button text>新增</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(task, index) in tasks"
              :key="index"
              :type="task.type"
              :timestamp="task.time"
            >
              {{ task.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Plus,
  Folder,
  Document,
  Connection,
  User,
} from "@element-plus/icons-vue";

// 用戶信息
const userInfo = ref({
  username: "John Hsiao",
});

// 當前日期
const currentDate = new Date().toLocaleDateString("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

// 最近專案數據
const recentProjects = [
  {
    name: "2024年度報告",
    status: "進行中",
    updatedAt: "2024-02-11 14:30",
  },
  {
    name: "產品發布計劃",
    status: "待審核",
    updatedAt: "2024-02-10 16:45",
  },
  {
    name: "市場調研分析",
    status: "進行中",
    updatedAt: "2024-02-09 09:15",
  },
];

// 待辦事項
const tasks = [
  {
    content: "完成專案提案",
    time: "09:30",
    type: "primary",
  },
  {
    content: "團隊會議",
    time: "14:00",
    type: "success",
  },
  {
    content: "審核文件",
    time: "16:30",
    type: "warning",
  },
];

// 處理新增專案
const handleCreateProject = () => {
  // TODO: 實現新增專案邏輯
};
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-card :deep(.el-card__body) {
  padding: 2rem;
}

.stat-card :deep(.el-card__header) {
  padding: 12px 16px;
  font-weight: 500;
}

.stat-card :deep(.el-card__body) {
  padding: 16px;
}
</style>
