<template>
  <div
    class="file-node"
    :class="{ selected: selected, 'is-uploading': isUploading }"
    @click="$emit('click', $event)"
  >
    <Handle
      type="target"
      position="top"
      :style="{ top: '-4px', opacity: targetVisible ? 1 : 0 }"
      @connect="onConnect"
      @mouseenter="targetVisible = true"
      @mouseleave="targetVisible = false"
    />

    <div class="file-content">
      <!-- 圖片預覽 - 只在上傳完成且是圖片類型時顯示 -->
      <div v-if="isImage && data.uploadProgress === 100" class="node-preview">
        <img :src="data.fileUrl" :alt="decodedFileName" class="preview-image" />
      </div>
      <!-- 上傳中或非圖片類型顯示圖標 -->
      <div v-else class="icon-wrapper">
        <component
          :is="getFileIcon(data.fileType)"
          :size="24"
          class="file-icon"
          :class="getIconColorClass(data.fileType)"
        />
        <div v-if="data.uploadProgress < 100" class="upload-overlay">
          {{ data.uploadProgress }}%
        </div>
      </div>

      <div class="file-info">
        <el-tooltip
          :content="data.fileName"
          placement="top"
          :show-after="500"
          :hide-after="0"
        >
          <div class="file-name" :title="data.fileName">
            {{ truncatedFileName }}
          </div>
        </el-tooltip>
        <div class="file-size">{{ formatFileSize(data.fileSize) }}</div>
        <div v-if="data.uploadProgress < 100" class="upload-progress">
          <el-progress
            :percentage="data.uploadProgress"
            :format="(p) => `${p}%`"
            :stroke-width="4"
            class="mt-1"
          />
        </div>
        <!-- 檔案操作按鈕 -->
        <div v-if="data.uploadProgress === 100" class="file-actions mt-2">
          <!-- 預覽按鈕 - 只對可預覽的檔案顯示 -->
          <el-button
            v-if="isPreviewable && !isOfficeFile"
            type="primary"
            link
            size="small"
            @click.stop="handlePreview"
          >
            <Eye :size="14" class="mr-1" />預覽
          </el-button>
          <!-- 下載按鈕 - 所有檔案都顯示 -->
          <el-button
            type="primary"
            link
            size="small"
            @click.stop="handleDownload"
          >
            <Download :size="14" class="mr-1" />下載
          </el-button>
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="bottom"
      :style="{ bottom: '-4px', opacity: sourceVisible ? 1 : 0 }"
      @connect="onConnect"
      @mouseenter="sourceVisible = true"
      @mouseleave="sourceVisible = false"
    />

    <!-- 右鍵選單 -->
    <el-dropdown trigger="contextmenu" @command="handleCommand">
      <div class="w-full h-full absolute top-0 left-0"></div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            command="preview"
            v-if="isPreviewable && !isOfficeFile"
          >
            <Eye :size="14" class="mr-2" />預覽
          </el-dropdown-item>
          <el-dropdown-item command="download">
            <Download :size="14" class="mr-2" />下載
          </el-dropdown-item>
          <el-dropdown-item command="delete" class="text-red-500">
            <Trash :size="14" class="mr-2" />刪除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 檔案預覽對話框 -->
    <el-dialog
      v-model="previewVisible"
      :title="data.fileName"
      :fullscreen="isFullscreen"
      :append-to-body="true"
      :close-on-click-modal="false"
      :show-close="false"
      class="file-preview-dialog"
      width="60%"
      top="5vh"
      :draggable="true"
      @click.stop
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="flex items-center justify-between w-full">
          <h4 :id="titleId" :class="titleClass">{{ data.fileName }}</h4>
          <div class="flex items-center space-x-2">
            <!-- 縮放控制 -->
            <el-button-group v-if="showZoomControls">
              <el-button @click="handleZoomOut">
                <ZoomOut :size="16" />
              </el-button>
              <el-button @click="handleZoomIn">
                <ZoomIn :size="16" />
              </el-button>
            </el-button-group>
            <!-- 全螢幕切換 -->
            <el-button @click="toggleFullscreen">
              <component
                :is="isFullscreen ? Minimize2 : Maximize2"
                :size="16"
              />
            </el-button>
            <!-- 關閉按鈕 -->
            <el-button @click="close">
              <X :size="16" />
            </el-button>
          </div>
        </div>
      </template>

      <div class="preview-content" :class="{ 'is-fullscreen': isFullscreen }">
        <!-- 圖片預覽 -->
        <div v-if="isImage" class="image-preview">
          {{ data.url }}
          <img
            ref="imageRef"
            :src="data.fileUrl"
            :alt="data.fileName"
            :style="{
              transform: `scale(${zoomLevel})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }"
            @mousedown.stop="startDrag"
            @mousemove.stop="onDrag"
            @mouseup.stop="stopDrag"
            @mouseleave.stop="stopDrag"
          />
        </div>

        <!-- PDF 預覽 -->
        <div v-else-if="isPdf" class="pdf-preview">
          <div class="pdf-controls">
            <div class="flex items-center justify-between w-full px-4">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="1"
                :total="totalPages"
                layout="prev, pager, next"
              />
            </div>
          </div>
          <div class="pdf-container" :class="{ 'is-fullscreen': isFullscreen }">
            <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
          </div>
        </div>

        <!-- Excel/CSV 預覽 -->
        <div v-else-if="isSpreadsheet" class="spreadsheet-preview">
          <el-table
            :data="spreadsheetData"
            border
            stripe
            height="70vh"
            style="width: 100%"
          >
            <el-table-column
              v-for="(col, index) in spreadsheetColumns"
              :key="index"
              :prop="col.prop"
              :label="col.label"
            />
          </el-table>
        </div>

        <!-- 文本預覽 -->
        <pre
          v-else-if="isText"
          class="text-preview"
          :class="{ 'is-fullscreen': isFullscreen }"
          >{{ textContent }}</pre
        >

        <!-- PPT 預覽 -->
        <div v-else-if="isPpt" class="ppt-preview">
          <PptPreview v-if="pptFile" :file="pptFile" @error="handlePptError" />
          <div v-else class="flex items-center justify-center h-full">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span class="ml-2">正在載入 PPT...</span>
          </div>
        </div>

        <!-- 不支援預覽 -->
        <div v-else class="unsupported-preview">
          <FileX :size="48" class="mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">此檔案類型不支援預覽</p>
          <p class="text-sm text-gray-500 mt-2">
            檔案類型：{{ data.fileType || "未知" }}
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, shallowRef } from "vue";
import { Handle } from "@vue-flow/core";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import {
  FileText,
  Image as ImageIcon,
  File,
  FileX,
  Eye,
  Download,
  Trash,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  FileType,
} from "lucide-vue-next";
import { Loading } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import PptPreview from "@/components/PptPreview.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  workflowId: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const sourceVisible = ref(false);
const targetVisible = ref(false);
const previewVisible = ref(false);
const textContent = ref("");
const isFullscreen = ref(false);
const zoomLevel = ref(1);
const currentPage = ref(1);
const totalPages = ref(1);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const imageRef = ref(null);
const pptFile = ref(null);

// 設置 PDF.js 的 worker 路徑
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// 檔案類型判斷
const isImage = computed(() => props.data.fileType?.startsWith("image/"));
const isPdf = computed(() => props.data.fileType === "application/pdf");
const isText = computed(() =>
  ["text/plain", "text/csv", "application/json"].includes(props.data.fileType)
);
const isSpreadsheet = computed(() =>
  [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ].includes(props.data.fileType)
);
const isPpt = computed(() => {
  const type = props.data.fileType?.toLowerCase();
  const filename = props.data.fileName?.toLowerCase();

  // 檢查檔案類型
  const validTypes = [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/powerpoint",
    "application/mspowerpoint",
    "application/x-mspowerpoint",
    "application/ppt",
  ];

  // 檢查副檔名
  const validExtensions = [".ppt", ".pptx"];

  console.log("檔案類型檢查：", {
    檔案名稱: filename,
    MIME類型: type,
    副檔名符合:
      filename && validExtensions.some((ext) => filename.endsWith(ext)),
    MIME類型符合: validTypes.includes(type),
    原始資料: props.data,
  });

  return (
    validTypes.includes(type) ||
    (filename && validExtensions.some((ext) => filename.endsWith(ext)))
  );
});

const isOfficeFile = computed(() => {
  const type = props.data.fileType?.toLowerCase();
  const filename = props.data.fileName?.toLowerCase();

  // 檢查檔案類型和副檔名
  return (
    type?.includes("powerpoint") ||
    type?.includes("excel") ||
    filename?.endsWith(".ppt") ||
    filename?.endsWith(".pptx") ||
    filename?.endsWith(".xls") ||
    filename?.endsWith(".xlsx")
  );
});

const isPreviewable = computed(
  () => isImage.value || isPdf.value || isText.value
);

// 是否顯示縮放控制
const showZoomControls = computed(() => isImage.value || isPdf.value);

// Excel/CSV 預覽數據
const spreadsheetData = ref([]);
const spreadsheetColumns = ref([]);

// const pdfDoc = ref(null);
// 使用 shallowRef 來優化效能(一定要用這個)
const pdfDoc = shallowRef();
const pdfCanvas = ref(null);
const pdfContext = ref(null);
const currentScale = ref(1.0);

// 解碼檔案名
const decodedFileName = computed(() => {
  console.log(
    "decodedFileName",
    props.data.fileName,
    decodeURI(props.data.fileName)
  );
  try {
    return props.data.fileName; //decodeURI(props.data.fileName);
  } catch (e) {
    return props.data.fileName;
  }
});

const isUploading = computed(() => {
  return (
    props.data.uploadProgress !== undefined && props.data.uploadProgress < 100
  );
});

// 載入 PDF 文件
const loadPDF = async (url) => {
  try {
    //console.log("開始載入 PDF：", url);

    // 確保 URL 是絕對路徑
    const absoluteUrl = url.startsWith("http")
      ? url
      : window.location.origin + url;
    //console.log("絕對路徑：", absoluteUrl);

    const loadingTask = pdfjsLib.getDocument({
      url: absoluteUrl,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/",
      cMapPacked: true,
    });

    // 添加載入進度處理
    loadingTask.onProgress = (progress) => {
      console.log("PDF 載入進度：", progress);
    };

    // arkRaw(await pdfjsLib.getDocument(url).promise);
    const pdf = await loadingTask.promise;
    pdfDoc.value = pdf;
    console.log("PDF 載入成功，總頁數：", pdf.numPages);

    totalPages.value = pdf.numPages;
    currentPage.value = 1;
    await renderPage(1);
  } catch (error) {
    console.error("PDF 載入失敗:", error);
    ElMessage.error({
      message: `PDF 載入失敗：${error.message}`,
      duration: 5000,
    });
  }
};

// 渲染 PDF 頁面
const renderPage = async (pageNumber) => {
  //console.log("渲染 PDF 頁面", pageNumber);
  if (!pdfDoc.value) return;

  try {
    const page = await pdfDoc.value.getPage(pageNumber);
    //console.log("page", page);
    const viewport = page.getViewport({ scale: currentScale.value });

    // 設置 canvas 大小
    const canvas = pdfCanvas.value;
    if (!canvas) {
      console.error("Canvas 元素不存在");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 渲染 PDF 頁面到 canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    try {
      await page.render(renderContext).promise;
    } catch (renderError) {
      console.error("PDF 頁面渲染失敗:", renderError);
      ElMessage.error("PDF 頁面渲染失敗");
    }
  } catch (error) {
    console.error("獲取 PDF 頁面失敗:", error);
    ElMessage.error("獲取 PDF 頁面失敗");
  }
};

// 監聽頁碼變化
watch(currentPage, (newPage) => {
  if (isPdf.value && pdfDoc.value) {
    renderPage(newPage);
  }
});

// 監聽縮放比例變化
watch(currentScale, (newScale) => {
  if (isPdf.value && pdfDoc.value) {
    renderPage(currentPage.value);
  }
});

// 處理縮放
const handleZoomIn = () => {
  if (isPdf.value) {
    currentScale.value = Math.min(currentScale.value + 0.2, 3);
  } else if (isImage.value) {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3);
  }
};

const handleZoomOut = () => {
  if (isPdf.value) {
    currentScale.value = Math.max(currentScale.value - 0.2, 0.5);
  } else if (isImage.value) {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5);
  }
};

// 處理全螢幕
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 處理圖片拖動
const startDrag = (e) => {
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
  };
};

const onDrag = (e) => {
  if (!isDragging.value || !imageRef.value) return;

  const dx = e.clientX - dragStart.value.x;
  const dy = e.clientY - dragStart.value.y;

  imageRef.value.style.transform = `scale(${zoomLevel.value}) translate(${dx}px, ${dy}px)`;
};

const stopDrag = () => {
  isDragging.value = false;
};

// 處理縮放
const handlePdfZoomIn = () => {
  currentScale.value = Math.min(currentScale.value + 0.2, 3);
  renderPage(currentPage.value);
};

const handlePdfZoomOut = () => {
  currentScale.value = Math.max(currentScale.value - 0.2, 0.5);
  renderPage(currentPage.value);
};

// 根據檔案類型獲取對應圖標和顏色
const getFileIcon = (type) => {
  if (!type) return File;
  type = type.toLowerCase();

  if (type.includes("image")) return ImageIcon;
  if (type.includes("pdf")) return FileText;
  if (
    type.includes("powerpoint") ||
    type.endsWith("ppt") ||
    type.endsWith("pptx")
  )
    return FileType;
  return File;
};

const getIconColorClass = (type) => {
  if (!type) return "text-gray-400";
  type = type.toLowerCase();

  // PPT 檔案使用橘紅色
  if (
    type.includes("powerpoint") ||
    type.endsWith("ppt") ||
    type.endsWith("pptx") ||
    type.includes("application/vnd.ms-powerpoint") ||
    type.includes(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
  )
    return "text-orange-600";

  // Excel 檔案使用綠色
  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.endsWith("xls") ||
    type.endsWith("xlsx")
  )
    return "text-green-600";

  // 其他檔案類型保持不變
  if (type.includes("image")) return "text-green-500";
  if (type.includes("pdf")) return "text-red-500";
  return "text-gray-400";
};

// 格式化檔案大小
const formatFileSize = (size) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let fileSize = size;

  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }

  return `${fileSize.toFixed(2)} ${units[index]}`;
};

// 處理檔案預覽
const handlePreview = async () => {
  if (!isPreviewable.value) {
    ElMessage.warning("此檔案類型不支援預覽");
    return;
  }

  // 重置預覽狀態
  zoomLevel.value = 1;
  currentPage.value = 1;
  isFullscreen.value = false;

  // 確保使用正確的 URL //TODO:here
  const fileUrl = props.data.fileUrl;
  console.log("預覽檔案：", {
    fileName: props.data.fileName,
    fileType: props.data.fileType,
    fileUrl: fileUrl,
  });

  if (isPpt.value) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      // 使用 Object.assign 來添加必要的屬性
      pptFile.value = Object.assign(blob, {
        lastModified: new Date().getTime(),
        name: props.data.fileName,
        // 如果 fileType 為空，則使用一個預設值
        type: props.data.fileType || "application/vnd.ms-powerpoint",
      });
    } catch (error) {
      console.error("PPT 檔案載入失敗：", error);
      ElMessage.error("無法載入 PPT 檔案");
      return;
    }
  }

  if (isText.value || isSpreadsheet.value) {
    try {
      const response = await fetch(fileUrl);
      const content = await response.text();

      if (isSpreadsheet.value) {
        // 解析 CSV 數據
        const rows = content.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        spreadsheetColumns.value = headers.map((header, index) => ({
          prop: `col${index}`,
          label: header,
        }));
        spreadsheetData.value = rows.slice(1).map((row) => {
          const rowData = {};
          row.forEach((cell, index) => {
            rowData[`col${index}`] = cell;
          });
          return rowData;
        });
      } else {
        textContent.value = content;
      }
    } catch (error) {
      console.error("檔案讀取失敗：", error);
      ElMessage.error("無法讀取檔案內容");
      return;
    }
  }

  previewVisible.value = true;
};

// 處理右鍵選單命令
const handleCommand = async (command) => {
  switch (command) {
    case "preview":
      await handlePreview();
      break;
    case "download":
      // 創建下載連結
      const link = document.createElement("a");
      link.href = props.data.fileUrl;
      link.download = props.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success("開始下載檔案");
      break;
    case "delete":
      ElMessageBox.confirm("確定要刪除此檔案嗎？", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        emit("delete", props.id);
      });
      break;
  }
};

const onConnect = (params) => {
  console.log("連接參數：", params);
};

// 在預覽對話框打開時載入 PDF
watch(previewVisible, async (visible) => {
  if (visible && isPdf.value && props.data.fileUrl) {
    // 重置縮放和頁碼
    currentScale.value = 1.0;
    currentPage.value = 1;

    // 確保檔案類型是 PDF 才進行載入
    if (props.data.fileType === "application/pdf") {
      console.log("載入 PDF", props.data.fileUrl);
      await loadPDF(props.data.fileUrl);
    } else {
      console.warn("非 PDF 檔案，跳過 PDF 載入");
    }
  }
});

// 監聽全螢幕狀態變化
watch(isFullscreen, () => {
  if (isPdf.value && pdfDoc.value) {
    // 在下一個 tick 重新渲染，確保容器大小已更新
    nextTick(() => {
      renderPage(currentPage.value);
    });
  }
});

// 檔案名截斷處理
const truncatedFileName = computed(() => {
  const fileName = props.data.fileName;
  if (!fileName) return "";

  const maxLength = 20; // 最大顯示長度

  // 如果檔案名包含副檔名
  if (fileName.includes(".")) {
    const parts = fileName.split(".");
    const ext = parts.pop(); // 取得副檔名
    const name = parts.join("."); // 檔案名（不含副檔名）

    if (name.length + ext.length + 1 <= maxLength) {
      return fileName;
    }

    // 計算要顯示的檔案名長度
    const availableLength = maxLength - ext.length - 3; // 減去省略號和點的長度
    if (availableLength < 1) {
      return `...${ext}`;
    }

    return `${name.slice(0, availableLength)}...${ext}`;
  }

  // 如果檔案名不包含副檔名
  if (fileName.length <= maxLength) {
    return fileName;
  }
  return `${fileName.slice(0, maxLength - 3)}...`;
});

// 處理 PPT 預覽失敗
const handlePptError = (error) => {
  ElMessage.error("PPT 預覽失敗：" + error.message);
};

// 監聽預覽對話框關閉事件，清理資源
watch(previewVisible, (visible) => {
  if (!visible) {
    pptFile.value = null;
  }

  if (visible && isPdf.value && props.data.fileUrl) {
    // ... existing PDF preview code ...
  }
});

// 添加下載處理函數
const handleDownload = () => {
  const link = document.createElement("a");
  link.href = props.data.fileUrl;
  link.download = props.data.fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success("開始下載檔案");
};
</script>

<style scoped>
.file-node {
  @apply bg-white rounded-lg shadow-md p-2 min-w-[200px] min-h-[60px] relative border-2 border-transparent;
  transition: all 0.2s ease;
}

.file-node.selected {
  @apply border-blue-500 shadow-lg;
}

.file-content {
  @apply flex items-center space-x-3;
}

.node-preview {
  @apply w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100;
}

.preview-image {
  @apply w-full h-full object-cover;
}

.icon-wrapper {
  @apply w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0 relative;
}

.file-icon {
  @apply flex-shrink-0;
}

.file-info {
  @apply flex-1 min-w-0 flex flex-col justify-center;
}

.file-name {
  @apply text-sm font-medium text-gray-700;
  max-width: 180px; /* 設置最大寬度 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  @apply text-xs text-gray-500;
}

.upload-progress {
  @apply mt-1;
}

.file-actions {
  @apply mt-2 flex items-center justify-end space-x-2;
}

/* Handle 樣式 */
:deep(.vue-flow__handle) {
  @apply w-3 h-3 bg-blue-500;
  transition: opacity 0.2s ease;
}

:deep(.vue-flow__handle:hover) {
  @apply bg-blue-600;
}

/* 預覽對話框樣式 */
.file-preview-dialog {
  :deep(.el-dialog) {
    @apply rounded-lg overflow-hidden;
  }

  :deep(.el-dialog__header) {
    @apply m-0 p-4 border-b border-gray-200;
  }

  :deep(.el-dialog__body) {
    @apply p-0;
  }

  :deep(.el-dialog__title) {
    @apply text-lg font-medium;
  }
}

.preview-content {
  @apply relative bg-gray-50;
  height: calc(90vh - 120px);
}

.image-preview {
  @apply h-full flex items-center justify-center bg-gray-900 bg-opacity-50;
}

.image-preview img {
  @apply max-w-full max-h-full object-contain;
  transition: transform 0.2s ease;
}

.pdf-preview {
  @apply h-full flex flex-col;
}

.pdf-controls {
  @apply bg-white border-b border-gray-200 p-4;
}

.pdf-container {
  @apply flex-1 overflow-auto p-4 flex justify-center;
}

.spreadsheet-preview {
  @apply bg-white rounded shadow;
}

.ppt-preview {
  @apply h-full flex flex-col items-center justify-center;
}

.unsupported-preview {
  @apply h-full flex flex-col items-center justify-center;
}
</style>
