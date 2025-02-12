<template>
  <el-card class="h-full" shadow="never">
    <template #header>
      <div class="flex justify-between items-center">
        <span>系統設置</span>
      </div>
    </template>

    <el-form :model="form" label-width="120px" class="max-w-3xl">
      <el-divider content-position="left">基本設置</el-divider>
      <el-form-item label="系統名稱">
        <el-input v-model="form.systemName" placeholder="請輸入系統名稱" />
      </el-form-item>
      <el-form-item label="系統描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="請輸入系統描述"
        />
      </el-form-item>

      <el-divider content-position="left">數據設置</el-divider>
      <el-form-item label="數據保存時間">
        <el-select v-model="form.dataRetention" class="w-full">
          <el-option label="7天" value="7" />
          <el-option label="30天" value="30" />
          <el-option label="90天" value="90" />
          <el-option label="180天" value="180" />
        </el-select>
      </el-form-item>
      <el-form-item label="自動備份">
        <el-switch v-model="form.autoBackup" />
      </el-form-item>
      <el-form-item label="備份頻率" v-if="form.autoBackup">
        <el-select v-model="form.backupFrequency" class="w-full">
          <el-option label="每天" value="daily" />
          <el-option label="每週" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">通知設置</el-divider>
      <el-form-item label="系統通知">
        <el-checkbox-group v-model="form.notifications">
          <el-checkbox label="email">郵件通知</el-checkbox>
          <el-checkbox label="system">系統通知</el-checkbox>
          <el-checkbox label="mobile">手機通知</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-divider content-position="left">安全設置</el-divider>
      <el-form-item label="登錄驗證">
        <el-radio-group v-model="form.loginAuth">
          <el-radio label="password">密碼驗證</el-radio>
          <el-radio label="2fa">雙因素驗證</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="會話超時">
        <el-input-number
          v-model="form.sessionTimeout"
          :min="15"
          :max="120"
          class="w-32"
        />
        <span class="ml-2 text-gray-600">分鐘</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存設置</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from "vue";

defineOptions({
  name: "Settings",
});

const form = ref({
  systemName: "良率分析平台",
  description: "",
  dataRetention: "30",
  autoBackup: true,
  backupFrequency: "daily",
  notifications: ["system"],
  loginAuth: "password",
  sessionTimeout: 30,
});

const handleSubmit = () => {
  // TODO: 提交設置
  console.log("Settings:", form.value);
};

const handleReset = () => {
  // TODO: 重置設置
};
</script>

<style scoped>
.el-card {
  @apply !border-none;
}

.el-divider__text {
  @apply !text-gray-600 !text-sm;
}
</style>
