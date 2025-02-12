<template>
  <div
    :class="['sticky-note', { 'is-selected': selected }]"
    :style="{
      backgroundColor: data.color || '#fef3c7',
      opacity: selected ? 1 : 0.6,
      zIndex: selected ? 1 : 0,
    }"
  >
    <NodeResizer
      v-if="selected"
      :min-width="150"
      :max-width="1000"
      :min-height="80"
      :max-height="500"
      :is-visible="selected"
      :line-style="{ borderColor: '#3b82f6' }"
      :handle-style="{ backgroundColor: '#3b82f6' }"
    />

    <div class="sticky-note-content">
      <el-input
        v-if="isEditing"
        v-model="editingContent"
        type="textarea"
        :autosize="{ minRows: 3 }"
        @blur="saveContent"
        ref="textInput"
        :placeholder="'在此輸入便利貼內容...'"
        class="sticky-note-textarea"
      />
      <div v-else class="sticky-note-text" @dblclick="startEditing">
        {{ data.content || "雙擊編輯內容" }}
      </div>
    </div>

    <div class="sticky-note-toolbar" v-if="selected">
      <el-button-group>
        <el-button
          size="small"
          @click="changeColor('#fef3c7')"
          class="color-btn"
          style="background-color: #fef3c7"
        />
        <el-button
          size="small"
          @click="changeColor('#dcfce7')"
          class="color-btn"
          style="background-color: #dcfce7"
        />
        <el-button
          size="small"
          @click="changeColor('#dbeafe')"
          class="color-btn"
          style="background-color: #dbeafe"
        />
        <el-button
          size="small"
          @click="changeColor('#fae8ff')"
          class="color-btn"
          style="background-color: #fae8ff"
        />
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";
import "@vue-flow/node-resizer/dist/style.css";

const props = defineProps({
  id: {
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

const { updateNode } = useVueFlow();
const isEditing = ref(false);
const editingContent = ref(props.data.content || "");
const textInput = ref(null);

const startEditing = () => {
  isEditing.value = true;
  editingContent.value = props.data.content || "";
  nextTick(() => {
    textInput.value?.focus();
  });
};

const saveContent = () => {
  isEditing.value = false;
  if (editingContent.value !== props.data.content) {
    updateNode(props.id, {
      data: {
        ...props.data,
        content: editingContent.value,
      },
    });
  }
};

const changeColor = (color) => {
  updateNode(props.id, {
    data: {
      ...props.data,
      color,
    },
  });
};
</script>

<style>
.vue-flow__node[data-type="sticky"] {
  background: transparent;
  border: none;
  padding: 0;
  border-radius: 0;
  min-width: 150px;
  width: auto;
  box-shadow: none;
}
</style>

<style scoped>
.sticky-note {
  @apply p-3 rounded-lg shadow-md transition-all duration-200;
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: center center;
}

.sticky-note.is-selected {
  @apply shadow-lg ring-2 ring-blue-500 ring-opacity-50;
}

.sticky-note-content {
  @apply w-full h-full;
}

.sticky-note-text {
  @apply text-gray-700 whitespace-pre-wrap break-words;
  padding: 0.5rem 0;
  height: 100%;
}

.sticky-note-textarea {
  @apply bg-transparent border-none shadow-none w-full h-full;
}

.sticky-note-toolbar {
  @apply absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-md p-1;
}

.color-btn {
  @apply w-6 h-6 p-0 border border-gray-200;
}

:deep(.el-textarea__inner) {
  @apply bg-transparent border-none shadow-none resize-none;
  height: 100% !important;
}

:deep(.vue-flow__resize-control.line) {
  @apply border-2;
}

:deep(.vue-flow__resize-control.handle) {
  @apply w-2 h-2;
}
</style>
