<template>
  <div class="api-test-container">
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <h3>API 測試頁面</h3>
        </div>
      </template>

      <!-- 用戶列表測試 -->
      <div class="test-section">
        <div class="section-header">
          <h4>用戶列表 API 測試</h4>
          <el-button
            type="primary"
            @click="handleFetchUsers"
            :loading="loading"
          >
            獲取用戶列表
          </el-button>
        </div>

        <!-- 用戶列表顯示 -->
        <el-table
          v-if="userList.length > 0"
          :data="userList"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="email" label="電子郵件" />
          <el-table-column prop="role" label="角色" />
          <el-table-column label="頭像" width="100">
            <template #default="{ row }">
              <el-avatar :src="row.avatar" :size="40">
                {{ row.nickname.charAt(0) }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === "active" ? "啟用" : "停用" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- API 響應數據 -->

        <!-- <div v-if="userApiResult" class="mt-4">
          <el-alert
            :title="userApiResult.success ? 'API 請求成功' : 'API 請求失敗'"
            :type="userApiResult.success ? 'success' : 'error'"
            :description="userApiResult.message"
            show-icon
          />
          <pre v-if="userApiResult.data" class="response-data">{{
            JSON.stringify(userApiResult.data, null, 2)
          }}</pre>
        </div> -->
      </div>

      <!-- 檔案上傳測試 -->
      <div class="test-section">
        <h4>檔案上傳測試</h4>
        <el-upload
          class="upload-demo"
          drag
          action="http://localhost:3001/api/file/upload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="handleBeforeUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖曳檔案到此處或 <em>點擊上傳</em></div>
        </el-upload>
      </div>

      <!-- 上傳結果顯示 -->
      <div class="test-section" v-if="uploadResult">
        <h4>上傳結果</h4>
        <el-alert
          :title="uploadResult.success ? '上傳成功' : '上傳失敗'"
          :type="uploadResult.success ? 'success' : 'error'"
          :description="uploadResult.message"
          show-icon
        />
        <pre class="response-data" v-if="uploadResult.data">{{
          JSON.stringify(uploadResult.data, null, 2)
        }}</pre>
      </div>

      <!-- API 請求日誌 -->
      <div class="test-section">
        <h4>API 請求日誌</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in requestLogs"
            :key="index"
            :type="log.success ? 'success' : 'danger'"
            :timestamp="log.timestamp"
          >
            {{ log.message }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { request } from "@/api/request";

const uploadResult = ref(null);
const requestLogs = ref([]);
const userList = ref([]);
const userApiResult = ref(null);
const loading = ref(false);

// 添加日誌
const addLog = (message, success = true) => {
  requestLogs.value.unshift({
    message,
    success,
    timestamp: new Date().toLocaleTimeString(),
  });
};

// 獲取用戶列表
const handleFetchUsers = async () => {
  loading.value = true;
  userApiResult.value = null; // 重置之前的結果
  addLog("開始獲取用戶列表");

  try {
    const response = await request.get("/user/list");
    console.log("API響應：", response);

    // 正確解析響應數據
    if (response.code === 200) {
      console.log("Mock 響應數據：", response.data);
      userList.value = response.data;
      userApiResult.value = {
        success: true,
        message: response.message,
        data: response.data,
      };
      addLog("獲取用戶列表成功");
    } else {
      throw new Error(response.message || "獲取用戶列表失敗");
    }
  } catch (error) {
    console.error("請求失敗：", error);
    userApiResult.value = {
      success: false,
      message: error.message || "獲取用戶列表失敗",
      data: null,
    };
    addLog(`獲取用戶列表失敗：${error.message || "未知錯誤"}`, false);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 100); // 給一個小延遲，確保 UI 更新順序正確
  }
};

// 上傳前處理
const handleBeforeUpload = (file) => {
  addLog(`準備上傳檔案：${file.name}`);
  return true;
};

// 上傳成功處理
const handleUploadSuccess = (response) => {
  uploadResult.value = {
    success: true,
    message: response.message,
    data: response.data,
  };
  addLog(`檔案上傳成功：${response.message}`);
};

// 上傳失敗處理
const handleUploadError = (error) => {
  uploadResult.value = {
    success: false,
    message: error.message || "上傳失敗",
    data: null,
  };
  addLog(`檔案上傳失敗：${error.message || "未知錯誤"}`, false);
};
</script>

<style scoped>
.api-test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.test-section h4 {
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

.response-data {
  margin-top: 15px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.el-timeline {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
