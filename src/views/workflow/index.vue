<template>
  <div class="workflow-container">
    <!-- 工作流程畫布區域 -->
    <div class="workflow-canvas">
      <WorkflowCanvas />
    </div>

    <!-- 浮動面板 -->
    <div
      class="workflow-panel"
      :class="{
        'panel-collapsed': isPanelCollapsed,
        'panel-fixed': !isPanelCollapsed,
      }"
      :style="!isPanelCollapsed ? { width: panelWidth + 'px' } : {}"
    >
      <!-- 拖動條 -->
      <div
        v-show="!isPanelCollapsed"
        class="resize-handle"
        @mousedown="handleResizeStart"
      ></div>

      <div class="panel-toggle" @click="handleTogglePanel">
        <component
          :is="isPanelCollapsed ? ChevronLeft : ChevronRight"
          :size="16"
          class="toggle-icon"
          :class="{ 'icon-collapsed': isPanelCollapsed }"
        />
      </div>

      <div
        class="panel-content"
        :style="{ width: isPanelCollapsed ? '0' : '100%' }"
      >
        <el-tabs tab-position="top" v-show="!isPanelCollapsed">
          <!-- 檔案上傳面板 -->
          <el-tab-pane class="flex-1 overflow-hidden">
            <template #label>
              <div class="flex items-center">
                <FileText :size="16" class="mr-1" />
                檔案
              </div>
            </template>

            <div class="h-full overflow-y-auto p-4">
              <FileUpload
                :workflowId="currentWorkflowId"
                :multiple="true"
                accept=".pdf,.jpg,.png,.xlsx,.csv,.ppt,.pptx,.xls,.xlsx"
                @file-uploaded="handleFileUploaded"
                @file-deleted="handleFileDeleted"
              />
            </div>
          </el-tab-pane>

          <!-- 節點配置面板 -->
          <el-tab-pane class="flex-1 overflow-hidden">
            <template #label>
              <div class="flex items-center">
                <Settings :size="16" class="mr-1" />
                設定
              </div>
            </template>
            <div class="h-full overflow-y-auto p-4">
              <NodeConfigPanel />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { FileText, Settings, ChevronLeft, ChevronRight } from "lucide-vue-next";
import WorkflowCanvas from "./components/WorkflowCanvas.vue";
import NodeConfigPanel from "./components/NodeConfigPanel.vue";
import FileUpload from "@/components/FileUpload.vue";

const route = useRoute();
// 當前工作流程 ID（從路由參數中獲取）
const currentWorkflowId = ref(
  route.params.id || "69f40f6e-6718-4588-881f-373444fe5ecb"
);
console.log(currentWorkflowId.value);

// 監聽路由參數變化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentWorkflowId.value = newId;
    }
  }
);

// 面板折疊狀態
const isPanelCollapsed = ref(false);

// 面板寬度
const panelWidth = ref(320);
const minWidth = 280;
const maxWidth = 600;

// resize 相關
const isResizing = ref(false);
let startX = 0;
let startWidth = 0;

// 處理開始 resize
const handleResizeStart = (e) => {
  isResizing.value = true;
  startX = e.clientX;
  startWidth = panelWidth.value;
  document.addEventListener("mousemove", handleResizeMove);
  document.addEventListener("mouseup", handleResizeEnd);
  // 添加 user-select: none 防止拖動時選中文字
  document.body.style.userSelect = "none";
};

// 處理 resize 移動
const handleResizeMove = (e) => {
  if (!isResizing.value) return;
  const deltaX = startX - e.clientX;
  const newWidth = Math.min(Math.max(startWidth + deltaX, minWidth), maxWidth);
  panelWidth.value = newWidth;
};

// 處理結束 resize
const handleResizeEnd = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
  document.body.style.userSelect = "";
};

// 處理面板折疊/展開
const handleTogglePanel = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value;
};

// 處理檔案上傳成功
const handleFileUploaded = (file) => {
  console.log("檔案上傳成功，詳細資訊：", {
    檔案名稱: file.fileName,
    檔案類型: file.fileType,
    檔案大小: file.fileSize,
    完整資料: file,
  });
};

// 處理檔案刪除
const handleFileDeleted = (file) => {
  console.log("檔案已刪除，詳細資訊：", {
    檔案名稱: file.fileName,
    檔案類型: file.fileType,
    完整資料: file,
  });
};

// 組件卸載時清理事件監聽
onUnmounted(() => {
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
});
</script>

<style scoped>
.workflow-container {
  @apply h-full flex relative;
  height: calc(100vh - 5.5rem);
}

.workflow-canvas {
  @apply flex-1 bg-gray-100 p-1;
  height: 100%;
}

.workflow-panel {
  height: 100%;
  transition: all 0.3s ease;
  z-index: 100;
}

.panel-fixed {
  @apply relative border-l bg-white flex;
  min-width: v-bind(minWidth + "px");
  max-width: v-bind(maxWidth + "px");
}

.panel-collapsed {
  @apply fixed right-0 top-[5.5rem] bottom-0;
  width: 0;
  background: white;
  border-left: 1px solid #e5e7eb;
}

.panel-toggle {
  @apply absolute left-0 top-[5.5rem] -translate-y-1/2;
  @apply w-6 h-12 bg-white rounded-l-md shadow-sm cursor-pointer;
  @apply flex items-center justify-center;
  @apply border border-r-0 border-gray-200;
  transform: translateX(-100%);
  transition: all 0.2s ease;
}

.panel-toggle:hover {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.toggle-icon {
  @apply text-gray-400;
  transition: color 0.2s ease;
}

.panel-toggle:hover .toggle-icon {
  color: white;
}

.icon-collapsed {
  @apply text-gray-600;
}

.panel-toggle:hover .icon-collapsed {
  color: white;
}

.panel-content {
  @apply w-full h-full flex flex-col bg-white;
  transition: opacity 0.3s ease;
}

:deep(.el-tabs) {
  @apply flex flex-col;
  height: 100%;
}

:deep(.el-tabs__header) {
  @apply m-0 border-b border-gray-200;
}

:deep(.el-tabs__nav-wrap) {
  @apply p-0;
}

:deep(.el-tabs__nav) {
  @apply w-full;
}

:deep(.el-tabs__item) {
  @apply flex-1 text-center !px-4 !h-10 flex items-center justify-center;
  font-size: 0.875rem;
}

:deep(.el-tabs__content) {
  @apply flex-1 overflow-hidden;
}

:deep(.el-tab-pane) {
  @apply h-full flex flex-col;
  padding: 0;
}

:deep(.el-tab-pane > div) {
  @apply flex-1 overflow-y-auto;
  padding: 1rem;
}

/* 覆蓋 element-plus 的預設樣式 */
:deep(.el-tabs--top) {
  @apply flex flex-col;
}

:deep(.el-tabs--top .el-tabs__header) {
  @apply order-first;
}

:deep(.el-tabs--top .el-tabs__content) {
  @apply flex-1;
}

/* 確保滾動條樣式一致 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* 拖動條樣式 */
.resize-handle {
  @apply absolute left-0 top-0 bottom-0 z-10;
  @apply w-1 cursor-col-resize;
  @apply bg-gray-200;
  transition: background-color 0.2s ease;
}

.resize-handle:hover {
  @apply bg-blue-600;
}

.resize-handle::after {
  content: "";
  @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
  /* @apply w-0.5 h-24 bg-gray-300; */
  @apply opacity-100;
}

.resize-handle:hover::after {
  @apply bg-gray-500;
}
</style>
