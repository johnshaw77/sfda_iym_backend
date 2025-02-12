<template>
  <div
    :class="[
      'custom-node',
      `node-type-${nodeConfig.type}`,
      { 'is-selected': selected },
    ]"
    :style="{ borderLeftColor: nodeConfig.color }"
  >
    <div class="custom-node-header">
      <component
        :is="nodeConfig.icon"
        :size="28"
        :color="nodeConfig.color"
        :stroke-width="1.5"
        class="flex-shrink-0"
      />
      <span class="ml-3 text-base">{{ nodeConfig.label }}</span>
      <component
        :is="statusConfig.icon"
        :size="14"
        :color="statusConfig.color"
        :stroke-width="1.5"
        class="absolute right-0 top-1/2 -translate-y-1/2"
      />
    </div>

    <div class="custom-node-content text-base" v-if="data.content">
      {{ data.content }}
    </div>

    <div class="custom-node-description text-sm text-gray-500 mt-2">
      {{ nodeConfig.description }}
    </div>

    <div class="custom-node-ports">
      <Handle
        v-if="nodeConfig.allowedInputs > 0"
        type="target"
        position="top"
        class="custom-handle"
        :style="{ backgroundColor: nodeConfig.color }"
        id="top"
      />
      <Handle
        type="source"
        position="right"
        class="custom-handle"
        :style="{ backgroundColor: nodeConfig.color }"
        id="right"
      />
      <Handle
        v-if="nodeConfig.allowedOutputs > 0"
        type="source"
        position="bottom"
        class="custom-handle"
        :style="{ backgroundColor: nodeConfig.color }"
        id="bottom"
      />
      <Handle
        type="target"
        position="left"
        class="custom-handle"
        :style="{ backgroundColor: nodeConfig.color }"
        id="left"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { getNodeConfig, getNodeStatus } from "../config/nodeTypes";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const nodeConfig = computed(() => {
  return getNodeConfig(props.data.type);
});

const statusConfig = computed(() => {
  return getNodeStatus(props.data.status || "IDLE");
});
</script>

<style scoped>
.custom-node {
  @apply bg-white rounded-lg shadow-md p-4 min-w-[240px] border-l-4 transition-all duration-200;
}

.custom-node.is-selected {
  @apply shadow-lg ring-2 ring-blue-500 ring-opacity-50;
}

.custom-node-header {
  @apply text-lg font-semibold mb-3 flex items-center relative;
}

.custom-node-content {
  @apply text-gray-600 mt-2;
}

.custom-handle {
  @apply w-3 h-3 rounded-full border-2 border-white transition-colors duration-200;
}

.custom-handle:hover {
  @apply opacity-80;
}

.custom-node-ports {
  @apply absolute left-0 right-0 -top-1.5 -bottom-1.5 pointer-events-none;
}

.custom-node-ports .custom-handle {
  @apply pointer-events-auto;
}

.custom-node-ports :deep(.right) {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
}

.custom-node-ports :deep(.left) {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
}

.custom-node-ports :deep(.top) {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.custom-node-ports :deep(.bottom) {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
