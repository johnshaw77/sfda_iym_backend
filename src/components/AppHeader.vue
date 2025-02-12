<template>
  <el-header
    class="!px-0 !h-12 fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200"
  >
    <div class="flex justify-between items-center h-full px-4">
      <!-- Logo 區域 -->
      <div class="flex items-center space-x-0">
        <img src="/logo.png" class="w-10 h-10" />
        <h1 class="text-xl font-semibold text-gray-800">良率分析平台</h1>
      </div>

      <!-- 右側工具列 -->
      <div class="flex items-center space-x-4">
        <!-- 通知圖標 -->
        <el-badge :value="3" :max="99" class="cursor-pointer">
          <el-tooltip content="通知" placement="bottom">
            <Bell :size="18" class="text-gray-600 hover:text-blue-500" />
          </el-tooltip>
        </el-badge>

        <!-- 設置圖標 -->
        <el-tooltip content="設置" placement="bottom">
          <Settings :size="18" class="cursor-pointer hover:text-blue-500" />
        </el-tooltip>

        <!-- 用戶選單 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="flex items-center space-x-2 cursor-pointer">
            <div class="relative" @click.stop="handleAvatarClick">
              <el-avatar
                :size="48"
                :src="userInfo.avatar"
                :alt="userInfo.username"
                class="!bg-blue-100 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span class="text-sm font-medium text-blue-600">{{
                  userInfo.username?.slice(0, 1)
                }}</span>
              </el-avatar>
              <div
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"
              ></div>
              <!-- 懸停提示 -->
              <div
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
              >
                點擊更換頭像
              </div>
            </div>
          </div>

          <template #dropdown>
            <el-dropdown-menu>
              <div class="px-4 py-2">
                <div class="font-medium text-gray-900">
                  {{ userInfo.username }}
                </div>
                <div class="text-sm text-gray-500">{{ userInfo.email }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ userInfo.role }}
                </div>
              </div>
              <el-divider class="!my-1" />
              <el-dropdown-item command="profile">
                <User :size="14" class="mr-2" />個人資料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <Settings :size="14" class="mr-2" />偏好設定
              </el-dropdown-item>
              <el-divider class="!my-1" />
              <el-dropdown-item command="notifications">
                <Bell :size="14" class="mr-2" />通知設定
              </el-dropdown-item>
              <el-dropdown-item command="privacy">
                <Shield :size="14" class="mr-2" />隱私權設定
              </el-dropdown-item>
              <el-divider class="!my-1" />
              <el-dropdown-item command="logout" class="!text-red-500">
                <LogOut :size="14" class="mr-2" />登出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 頭像上傳對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="更換頭像"
      width="420px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="flex flex-col items-center">
        <!-- 預覽區域 -->
        <div class="mb-4 relative group">
          <el-upload
            ref="avatarUploadRef"
            class="avatar-preview-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/jpeg,image/png,image/gif"
            drag
          >
            <el-avatar
              :size="120"
              :src="previewUrl || userInfo.avatar"
              class="!bg-blue-100 hover:opacity-80 transition-all duration-300"
            >
              <span class="text-2xl font-medium text-blue-600">{{
                userInfo.username?.slice(0, 1)
              }}</span>
            </el-avatar>
            <!-- 懸停提示 -->
            <div
              class="absolute inset-0 bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <div class="text-white text-sm">
                <Upload class="mx-auto mb-1" :size="20" />
                <div class="text-xs">點擊或拖拉</div>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 上傳區域 -->
        <!-- <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept="image/jpeg,image/png,image/gif"
          drag
        >
          <div
            class="upload-area p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <Upload class="mx-auto mb-2 text-gray-400" :size="24" />
            <div class="text-gray-600">拖拉圖片至此處，或</div>
            <el-button type="primary" class="mt-2"> 點擊選擇圖片 </el-button>
          </div>
        </el-upload> -->

        <!-- 提示文字 -->
        <p class="text-xs text-gray-500 mt-2">
          支援 JPG、PNG、GIF 格式，檔案大小不超過 2MB
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="handleUpload"
          >
            確認上傳
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Bell, Settings, User, Shield, LogOut, Upload } from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCurrentUser, updateAvatar } from "@/api";

const router = useRouter();
const userInfo = ref({
  username: "",
  email: "",
  role: "",
  avatar: "",
});

// 上傳相關狀態
const dialogVisible = ref(false);
const uploadRef = ref(null);
const selectedFile = ref(null);
const previewUrl = ref("");
const uploading = ref(false);

// 獲取用戶資訊
const fetchUserInfo = async () => {
  try {
    const data = await getCurrentUser();
    // 確保頭像 URL 是完整的，但不包含 api 路徑
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, "");
    userInfo.value = {
      ...data,
      avatar: data.avatar ? `${baseUrl}${data.avatar}` : "",
    };
  } catch (error) {
    console.error("獲取用戶資訊失敗:", error);
  }
};

// 處理頭像點擊
const handleAvatarClick = (e) => {
  e.stopPropagation();
  dialogVisible.value = true;
};

// 處理檔案選擇
const handleFileChange = (file) => {
  // 檢查檔案大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error("檔案大小不能超過 2MB");
    return false;
  }

  // 檢查檔案類型
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error("只支援 JPG、PNG、GIF 格式的圖片");
    return false;
  }

  selectedFile.value = file.raw;
  previewUrl.value = URL.createObjectURL(file.raw);
};

// 處理上傳
const handleUpload = async () => {
  if (!selectedFile.value) return;

  try {
    uploading.value = true;
    const formData = new FormData();
    formData.append("avatar", selectedFile.value);

    const { user } = await updateAvatar(formData);

    // 更新用戶資訊，確保頭像 URL 是完整的，但不包含 api 路徑
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, "");
    userInfo.value = {
      ...userInfo.value,
      ...user,
      avatar: user.avatar ? `${baseUrl}${user.avatar}` : "",
    };

    // 清理預覽 URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }

    ElMessage.success("頭像更新成功");
    handleCancel();
  } catch (error) {
    console.error("上傳頭像失敗:", error);
    ElMessage.error(
      error.response?.data?.message || "上傳頭像失敗，請稍後再試"
    );
  } finally {
    uploading.value = false;
  }
};

// 處理取消
const handleCancel = () => {
  dialogVisible.value = false;
  selectedFile.value = null;
  // 清理預覽 URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 處理下拉選單命令
const handleCommand = async (command) => {
  switch (command) {
    case "profile":
      router.push("/settings/profile");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "notifications":
      router.push("/settings/notifications");
      break;
    case "privacy":
      router.push("/settings/privacy");
      break;
    case "logout":
      try {
        await ElMessageBox.confirm("確定要登出嗎？", "登出確認", {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        });
        localStorage.removeItem("token");
        router.push("/login");
        ElMessage.success("已成功登出");
      } catch {
        // 用戶取消登出
      }
      break;
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.el-dropdown-menu {
  @apply min-w-[240px];
}
:deep(.el-upload-dragger) {
  @apply w-full border-none p-0;
}
.avatar-uploader {
  :deep(.el-upload) {
    @apply w-full;
  }

  :deep(.el-upload-dragger) {
    @apply w-full border-none p-0;
  }

  :deep(.el-upload-dragger:hover) {
    @apply bg-transparent;
  }

  .upload-area {
    @apply w-full flex flex-col items-center;
  }
}

.avatar-preview-uploader {
  :deep(.el-upload) {
    @apply block;
  }

  :deep(.el-upload-dragger) {
    @apply w-[120px] h-[120px] border-none p-0 bg-transparent;
  }

  :deep(.el-upload-dragger:hover) {
    @apply bg-transparent;
  }
}

/* 懸停效果 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
