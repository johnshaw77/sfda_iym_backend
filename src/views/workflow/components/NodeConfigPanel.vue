<template>
  <div v-if="selectedNode" class="node-config-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">節點配置</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <X :size="16" />
      </button>
    </div>

    <div class="panel-content">
      <div class="form-group">
        <label>節點類型</label>
        <select v-model="nodeData.type" class="form-select">
          <option value="input">數據輸入</option>
          <option value="process">數據處理</option>
          <option value="analysis">數據分析</option>
          <option value="visualization">數據可視化</option>
          <option value="output">輸出結果</option>
        </select>
      </div>

      <div class="form-group">
        <label>節點名稱</label>
        <input v-model="nodeData.label" type="text" class="form-input" />
      </div>

      <div class="form-group">
        <label>描述</label>
        <textarea v-model="nodeData.content" class="form-textarea"></textarea>
      </div>

      <div class="form-group" v-if="nodeData.type === 'input'">
        <label>數據來源</label>
        <div class="flex items-center space-x-2">
          <button class="btn-secondary" @click="handleFileUpload">
            <Upload :size="16" class="mr-2" />
            上傳文件
          </button>
          <span v-if="nodeData.file" class="text-sm text-gray-600">
            {{ nodeData.file.name }}
          </span>
        </div>
      </div>

      <div class="form-group" v-if="nodeData.type === 'analysis'">
        <label>分析方法</label>
        <select v-model="nodeData.analysisMethod" class="form-select">
          <option value="correlation">相關性分析</option>
          <option value="regression">回歸分析</option>
          <option value="classification">分類分析</option>
          <option value="clustering">聚類分析</option>
        </select>
      </div>

      <div class="form-group" v-if="nodeData.type === 'visualization'">
        <label>圖表類型</label>
        <select v-model="nodeData.chartType" class="form-select">
          <option value="line">折線圖</option>
          <option value="bar">柱狀圖</option>
          <option value="scatter">散點圖</option>
          <option value="pie">餅圖</option>
        </select>
      </div>
    </div>

    <div class="panel-footer">
      <button class="btn-primary" @click="handleSave">保存</button>
      <button class="btn-secondary" @click="$emit('close')">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  selectedNode: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:node", "close"]);

const nodeData = ref({ ...props.selectedNode?.data });

const handleSave = () => {
  emit("update:node", {
    ...props.selectedNode,
    data: nodeData.value,
  });
  emit("close");
};

const handleFileUpload = () => {
  // TODO: 實現文件上傳邏輯
};
</script>

<style scoped>
.node-config-panel {
  @apply bg-white rounded-lg shadow-lg p-4 w-80 flex flex-col;
}

.panel-header {
  @apply flex justify-between items-center mb-4 pb-2 border-b;
}

.panel-content {
  @apply flex-1 overflow-y-auto;
}

.panel-footer {
  @apply flex justify-end space-x-2 mt-4 pt-4 border-t;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

.form-textarea {
  @apply h-24 resize-none;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors;
}
</style>
