// 這個元件是為了在連線上添加按鈕，讓使用者可以更方便地調整連線的樣式,
並且可以刪除連線，編輯連線標籤，切換動畫，調整位置 // 暫時用不上，保留。
<template>
  <BaseEdge
    :id="id"
    :style="style"
    :path="path[0]"
    :marker-end="markerEnd"
    class="vue-flow__edge-path"
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        zIndex: 1000,
      }"
      class="nodrag nopan edge-buttons-container"
    >
      <el-tooltip
        content="刪除連線"
        placement="top"
        :show-after="300"
        :hide-after="0"
      >
        <el-button
          circle
          size="small"
          type="danger"
          class="edge-button edge-delete-button"
          @click="handleDeleteEdge"
          @mousedown.stop
          @click.stop
        >
          <X :size="16" />
        </el-button>
      </el-tooltip>

      <el-tooltip
        content="編輯標籤"
        placement="top"
        :show-after="300"
        :hide-after="0"
      >
        <el-button
          circle
          size="small"
          type="primary"
          class="edge-button edge-edit-button"
          @click="handleEditLabel"
          @mousedown.stop
          @click.stop
        >
          <Edit :size="16" />
        </el-button>
      </el-tooltip>

      <el-tooltip
        content="切換動畫"
        placement="top"
        :show-after="300"
        :hide-after="0"
      >
        <el-button
          circle
          size="small"
          :type="isAnimated ? 'success' : 'info'"
          class="edge-button edge-animate-button"
          @click="handleToggleAnimation"
          @mousedown.stop
          @click.stop
        >
          <component :is="isAnimated ? Play : Pause" :size="16" />
        </el-button>
      </el-tooltip>

      <el-tooltip
        content="調整位置"
        placement="top"
        :show-after="300"
        :hide-after="0"
      >
        <el-button
          circle
          size="small"
          type="warning"
          class="edge-button edge-position-button"
          @click="handleAdjustPosition"
          @mousedown.stop
          @click.stop
        >
          <MoveVertical :size="16" />
        </el-button>
      </el-tooltip>
    </div>

    <el-dialog
      v-model="showLabelDialog"
      title="編輯連線標籤"
      width="30%"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      :style="dialogStyle"
    >
      <el-form :model="labelForm" label-width="80px">
        <el-form-item label="標籤文字">
          <el-input v-model="labelForm.text" placeholder="請輸入標籤文字" />
        </el-form-item>
        <el-form-item label="文字顏色">
          <el-color-picker v-model="labelForm.color" />
        </el-form-item>
        <el-form-item label="線條樣式">
          <el-select v-model="labelForm.lineStyle" placeholder="請選擇線條樣式">
            <el-option label="實線" value="solid" />
            <el-option label="虛線" value="dashed" />
            <el-option label="點線" value="dotted" />
          </el-select>
        </el-form-item>
        <el-form-item label="線條粗細">
          <el-slider
            v-model="labelForm.strokeWidth"
            :min="1"
            :max="5"
            :step="0.5"
            show-stops
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showLabelDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveLabel">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </EdgeLabelRenderer>
</template>

<script setup>
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useVueFlow,
} from "@vue-flow/core";
import { computed, ref } from "vue";
import { toRaw } from "vue";
import { X, Edit, Play, Pause, MoveVertical } from "lucide-vue-next";
import { ElMessageBox, ElMessage } from "element-plus";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  markerEnd: {
    type: String,
    required: false,
  },
  style: {
    type: Object,
    required: false,
  },
  label: {
    type: String,
    required: false,
    default: "",
  },
  animated: {
    type: Boolean,
    required: false,
    default: false,
  },
  selected: {
    type: Boolean,
    required: false,
    default: false,
  },
  source: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
});

const vueFlowInstance = useVueFlow();
const { removeEdges } = vueFlowInstance;

const path = computed(() => getBezierPath(props));
const isAnimated = ref(props.animated);
const showLabelDialog = ref(false);
const dialogStyle = {
  zIndex: 10001,
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};
const labelForm = ref({
  text: props.label || "",
  color: props.style?.stroke || "#3f3f3f",
  lineStyle: props.style?.strokeDasharray ? "dashed" : "solid",
  strokeWidth: props.style?.strokeWidth || 2,
});

const handleDeleteEdge = () => {
  ElMessageBox.confirm("確定要刪除這條連接線嗎？", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      removeEdges([props.id]);
      ElMessage({
        type: "success",
        message: "已刪除連接線",
      });
    })
    .catch(() => {
      // 用戶取消刪除操作
    });
};

const handleEditLabel = () => {
  showLabelDialog.value = true;
};

const handleSaveLabel = () => {
  const edge = vueFlowInstance.edges.value.find((e) => e.id === props.id);
  if (!edge) {
    ElMessage({
      type: "error",
      message: "找不到要更新的連線",
    });
    return;
  }

  const newStyle = {
    ...edge.style,
    stroke: labelForm.value.color,
    strokeWidth: labelForm.value.strokeWidth,
    strokeDasharray:
      labelForm.value.lineStyle === "dashed"
        ? "5 5"
        : labelForm.value.lineStyle === "dotted"
        ? "2 2"
        : undefined,
  };

  const updatedEdge = {
    ...edge,
    label: labelForm.value.text,
    style: newStyle,
    markerEnd: {
      type: "arrowclosed",
      color: labelForm.value.color,
    },
  };

  vueFlowInstance.setEdges(
    vueFlowInstance.edges.value.map((e) =>
      e.id === props.id ? updatedEdge : e
    )
  );

  showLabelDialog.value = false;
  ElMessage({
    type: "success",
    message: "已更新連線樣式",
  });
};

const handleToggleAnimation = () => {
  const edge = vueFlowInstance.edges.value.find((e) => e.id === props.id);
  if (!edge) {
    ElMessage({
      type: "error",
      message: "找不到要更新的連線",
    });
    return;
  }

  isAnimated.value = !isAnimated.value;
  const updatedEdge = {
    ...edge,
    animated: isAnimated.value,
  };

  vueFlowInstance.setEdges(
    vueFlowInstance.edges.value.map((e) =>
      e.id === props.id ? updatedEdge : e
    )
  );
};

const handleAdjustPosition = () => {
  ElMessageBox.alert(
    "拖動連線的起點或終點來調整位置。你也可以拖動連線中間的部分來調整曲線。",
    "提示",
    {
      confirmButtonText: "知道了",
    }
  );
};
</script>

<script>
export default {
  inheritAttrs: false,
};
</script>

<style scoped>
.edge-buttons-container {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
}

.edge-button {
  @apply !w-8 !h-8 !p-1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edge-button :deep(svg) {
  color: currentColor;
  stroke-width: 2;
}

.edge-button.edge-delete-button {
  @apply !bg-white !text-red-500 hover:!bg-red-500 hover:!text-white;
}

.edge-button.edge-edit-button {
  @apply !bg-white !text-blue-500 hover:!bg-blue-500 hover:!text-white;
}

.edge-button.edge-animate-button {
  @apply !bg-white !text-green-500 hover:!bg-green-500 hover:!text-white;
}

.edge-button.edge-position-button {
  @apply !bg-white !text-yellow-500 hover:!bg-yellow-500 hover:!text-white;
}

.edge-button:hover {
  transform: scale(1.1);
}

:deep(.vue-flow__edge:hover) ~ .edge-buttons-container,
:deep(.vue-flow__edge.selected) ~ .edge-buttons-container,
.edge-buttons-container:hover {
  opacity: 1;
  transform: translateY(-10px);
}

:deep(.vue-flow__edge.animated) path {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

.nodrag {
  pointer-events: all !important;
}

.nopan {
  pointer-events: all !important;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style>
