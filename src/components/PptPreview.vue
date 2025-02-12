/** * 簡報預覽 * 沒能成功運行!!!! */
<template>
  <div class="ppt-preview-container">
    <!-- 工具欄 -->
    <div class="preview-toolbar">
      <div class="left-tools">
        <el-button-group>
          <el-button :disabled="currentPage === 1" @click="handlePrevPage">
            <template #icon>
              <el-icon><ArrowLeft /></el-icon>
            </template>
          </el-button>
          <el-button
            :disabled="currentPage === totalPages"
            @click="handleNextPage"
          >
            <template #icon>
              <el-icon><ArrowRight /></el-icon>
            </template>
          </el-button>
        </el-button-group>
        <span class="page-info ml-3">{{ currentPage }} / {{ totalPages }}</span>
      </div>

      <div class="right-tools">
        <el-button-group>
          <el-button @click="handleZoomOut" :disabled="zoom <= 0.5">
            <template #icon>
              <el-icon><Minus /></el-icon>
            </template>
          </el-button>
          <el-button>{{ Math.round(zoom * 100) }}%</el-button>
          <el-button @click="handleZoomIn" :disabled="zoom >= 2">
            <template #icon>
              <el-icon><Plus /></el-icon>
            </template>
          </el-button>
        </el-button-group>

        <el-button class="ml-2" @click="toggleFullscreen">
          <template #icon>
            <el-icon><FullScreen /></el-icon>
          </template>
        </el-button>

        <el-button class="ml-2" @click="handleDownload">
          <template #icon>
            <el-icon><Download /></el-icon>
          </template>
        </el-button>
      </div>
    </div>

    <!-- 預覽區域 -->
    <div class="preview-content" ref="previewRef">
      <div
        class="slide-container"
        :style="{
          transform: `scale(${zoom})`,
          opacity: loading ? 0 : 1,
        }"
      >
        <div v-if="loading" class="loading-overlay">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在載入...</span>
        </div>
        <canvas ref="slideCanvas" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import {
  ArrowLeft,
  ArrowRight,
  FullScreen,
  Download,
  Plus,
  Minus,
  Loading,
} from "@element-plus/icons-vue";
import PptxGenJS from "pptxgenjs";

const props = defineProps({
  file: {
    type: File,
    required: true,
  },
});

const emit = defineEmits(["error"]);

// 狀態
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const zoom = ref(1);
const previewRef = ref(null);
const slideCanvas = ref(null);

// PPT 實例
let pptx = null;
let slides = [];

// 初始化 PPT
const initPpt = async () => {
  try {
    loading.value = true;
    pptx = new PptxGenJS();

    // 讀取文件
    const arrayBuffer = await props.file.arrayBuffer();
    await pptx.load(arrayBuffer);

    // 獲取所有幻燈片
    slides = pptx.getSlides();
    totalPages.value = slides.length;

    // 渲染第一頁
    await renderCurrentSlide();
  } catch (error) {
    console.error("PPT 載入失敗:", error);
    emit("error", error);
  } finally {
    loading.value = false;
  }
};

// 渲染當前頁面
const renderCurrentSlide = async () => {
  if (!slides.length) return;

  const slide = slides[currentPage.value - 1];
  const canvas = slideCanvas.value;

  // 清空畫布
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 設置畫布大小
  canvas.width = 960; // 16:9 比例
  canvas.height = 540;

  // 渲染幻燈片
  await slide.render(canvas);
};

// 頁面控制
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 縮放控制
const handleZoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2);
};

const handleZoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5);
};

// 全螢幕
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    previewRef.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 下載
const handleDownload = () => {
  const url = URL.createObjectURL(props.file);
  const a = document.createElement("a");
  a.href = url;
  a.download = props.file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 監聽頁碼變化
watch(currentPage, async () => {
  loading.value = true;
  await renderCurrentSlide();
  loading.value = false;
});

// 組件掛載時初始化
onMounted(() => {
  initPpt();
});
</script>

<style scoped>
.ppt-preview-container {
  @apply flex flex-col h-full bg-gray-100;
}

.preview-toolbar {
  @apply flex justify-between items-center px-4 py-2 bg-white border-b;
}

.left-tools,
.right-tools {
  @apply flex items-center;
}

.page-info {
  @apply text-gray-600 text-sm;
}

.preview-content {
  @apply flex-1 overflow-auto relative;
  @apply flex items-center justify-center;
}

.slide-container {
  @apply bg-white shadow-md;
  @apply transition-all duration-200;
  transform-origin: center center;
}

.loading-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply bg-white bg-opacity-90;
  @apply text-gray-600 gap-2;
}

canvas {
  @apply block;
}
</style>
