<template>
  <div
    class="file-upload-zone"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'is-dragover': isDragOver }"
  >
    <div class="upload-content">
      <Upload v-if="!isDragOver" :size="32" class="text-gray-400" />
      <CloudUpload v-else :size="32" class="text-blue-500" />
      <div class="mt-2 text-sm" v-if="!isDragOver">
        <span class="text-gray-600">拖拉檔案至此處，或</span>
        <label class="text-blue-500 cursor-pointer hover:text-blue-600">
          點擊上傳
          <input
            type="file"
            class="hidden"
            :multiple="multiple"
            :accept="accept"
            @change="handleFileSelect"
          />
        </label>
      </div>
      <div class="mt-2 text-sm text-blue-500" v-else>釋放滑鼠以上傳檔案</div>
      <div class="mt-1 text-xs text-gray-400">
        {{ acceptText }}
      </div>
    </div>
    <!-- 檔案列表(右側的面板) -->
    <div v-if="fileList.length > 0" class="mt-4">
      <div
        v-for="file in fileList"
        :key="file.id"
        class="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded"
      >
        <div class="flex items-center">
          <component
            :is="getFileIcon(file.fileType)"
            :size="20"
            class="text-gray-400"
          />
          <span class="ml-2 text-sm text-gray-600">{{ file.fileName }}</span>
          <span class="ml-2 text-xs text-gray-400"
            >({{ formatFileSize(file.fileSize) }})</span
          >
        </div>
        <div class="flex items-center space-x-2">
          <el-button
            v-if="file.fileUrl"
            type="primary"
            link
            size="small"
            @click="handleDownload(file)"
          >
            <Download :size="14" class="mr-1" />
            下載
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            @click="handleDelete(file)"
          >
            <Trash :size="14" class="mr-1" />
            刪除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  Upload,
  CloudUpload,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Trash,
} from "lucide-vue-next";
import {
  uploadWorkflowFile,
  deleteWorkflowFile,
  downloadWorkflowFile,
} from "@/api/modules/workflow";

const props = defineProps({
  // 是否允許多檔案上傳
  multiple: {
    type: Boolean,
    default: true,
  },
  // 接受的檔案類型
  accept: {
    type: String,
    default: "*",
  },
  // 工作流程 ID
  workflowId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:fileList", "file-uploaded", "file-deleted"]);

// 拖拉狀態
const isDragOver = ref(false);

// 檔案列表
const fileList = ref([]);

// 根據 accept 屬性生成提示文字
const acceptText = computed(() => {
  if (props.accept === "*") return "支援所有檔案類型";
  return `支援的檔案類型：${props.accept}`;
});

// 處理拖拉事件
const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = async (e) => {
  isDragOver.value = false;
  const files = Array.from(e.dataTransfer.files);
  await handleFiles(files);
};

// 處理檔案選擇
const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files);
  await handleFiles(files);
  e.target.value = ""; // 重置 input
};

// 處理檔案上傳
const handleFiles = async (files) => {
  for (const file of files) {
    try {
      const result = await uploadWorkflowFile(file, props.workflowId);
      fileList.value.push(result);
      emit("file-uploaded", result);
      ElMessage.success("檔案上傳成功");
    } catch (error) {
      ElMessage.error(`檔案 ${file.name} 上傳失敗`);
    }
  }
};

// 處理檔案刪除
const handleDelete = async (file) => {
  try {
    await deleteWorkflowFile(file.id);
    fileList.value = fileList.value.filter((f) => f.id !== file.id);
    emit("file-deleted", file);
    ElMessage.success("檔案刪除成功");
  } catch (error) {
    ElMessage.error("檔案刪除失敗");
  }
};

// 處理檔案下載
const handleDownload = async (file) => {
  try {
    const result = await downloadWorkflowFile(file.id);
    // 創建下載連結
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    ElMessage.error("檔案下載失敗");
  }
};

// 根據檔案類型獲取對應圖標
const getFileIcon = (type) => {
  console.log("getFileIcon", type);
  if (type.startsWith("image/")) return ImageIcon;
  if (type.includes("pdf")) return FileText;
  return File;
};

// 格式化檔案大小
const formatFileSize = (size) => {
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let fileSize = size;

  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }

  return `${fileSize.toFixed(2)} ${units[index]}`;
};
</script>

<style scoped>
.file-upload-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors duration-200;
}

.file-upload-zone:hover {
  @apply border-blue-500;
}

.file-upload-zone.is-dragover {
  @apply border-blue-500 bg-blue-50;
}

.upload-content {
  @apply flex flex-col items-center justify-center;
}
</style>
