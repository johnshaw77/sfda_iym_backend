<template>
  <div class="h-full bg-slate-50">
    <VueFlow
      v-model:nodes="nodes2"
      v-model:edges="edges2"
      class="h-full"
      :default-zoom="1.5"
      :min-zoom="0.2"
      :max-zoom="4"
      @edgeUpdate="onEdgeUpdate"
      @connect="onConnect"
      @edgeUpdateStart="onEdgeUpdateStart"
      @edgeUpdateEnd="onEdgeUpdateEnd"
      :fit-view-on-init="true"
    >
      <Background v-slot="bgProps" />
      <MiniMap />
      <Controls />
    </VueFlow>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
// import "@vue-flow/background/dist/style.css";

defineOptions({
  name: "WorkflowTest",
});

const { findEdge, updateEdge, addEdges } = useVueFlow({
  id: "workflow-test",
  defaultEdgeOptions: {
    animated: true,
    updatable: true,
  },
});

// 初始節點和連線
const nodes2 = ref([
  {
    id: "1",
    type: "input",
    label: "開始節點",
    position: { x: 0, y: 0 },
    class: "light",
  },
  {
    id: "2",
    label: "處理節點",
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    label: "處理節點2",
    position: { x: 300, y: 200 },
  },
  {
    id: "4",
    label: "結束節點",
    position: { x: 400, y: 300 },
  },
]);

const edges2 = ref([
  // {
  //   id: "e1-2",
  //   source: "1",
  //   target: "2",
  //   label: "Updateable edge",
  //   updatable: true,
  // },
  // {
  //   id: "e1-2",
  //   source: "1",
  //   target: "2",
  //   animated: true,
  //   label: "Updateable edge",
  //   updatable: true,
  // },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    label: "Updateable edge",
    updatable: true,
  },
  // {
  //   id: "e2-3",
  //   source: "2",
  //   target: "3",
  //   label: "Updateable edge",
  //   updatable: true,
  // },
]);

const nodes = ref([
  {
    id: "1",
    type: "input",
    data: { label: "Node <strong>A</strong>" },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    data: { label: "Node <strong>B</strong>" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "Node <strong>C</strong>" },
    position: { x: 400, y: 100 },
    style: {
      background: "#D6D5E6",
      color: "#333",
      border: "1px solid #222138",
      width: 180,
    },
  },
]);

const edges = ref([
  {
    id: "e1-2",
    source: "1",
    target: "2",
    label: "Updateable edge",
    updatable: true,
  },
]);
const onConnect = (params) => {
  addEdges([
    {
      ...params,
      animated: true,
      updatable: true,
    },
  ]);
};

const onEdgeUpdate = ({ edge, connection }) => {
  console.log("onEdgeUpdate", edge, connection);
  if (!edge || !connection) {
    console.warn("更新線條時缺少必要參數");
    return;
  }
  updateEdge(edge, connection);
};

const onEdgeUpdateStart = (params) => {
  console.log("onEdgeUpdateStart", params);
};

const onEdgeUpdateEnd = (params) => {
  console.log("onEdgeUpdateEnd", params);
};
</script>

<style scoped>
:deep(.vue-flow__node) {
  @apply px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm;
}

:deep(.vue-flow__node.light) {
  @apply bg-white text-gray-800;
}

:deep(.vue-flow__edge-path) {
  @apply stroke-2 stroke-gray-400;
}

:deep(.vue-flow__minimap) {
  @apply rounded-lg border border-gray-200 bg-white;
}

:deep(.vue-flow__controls) {
  @apply rounded-lg border border-gray-200 bg-white shadow-sm;
}

:deep(.vue-flow__controls-button) {
  @apply border-gray-200 hover:bg-gray-50;
}
</style>
