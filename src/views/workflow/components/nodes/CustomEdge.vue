<script setup>
import { BezierEdge } from "@vue-flow/core";

// props were passed from the slot using `v-bind="customEdgeProps"`
const props = defineProps([
  "sourceX",
  "sourceY",
  "targetX",
  "targetY",
  "sourcePosition",
  "targetPosition",
]);
</script>

<template>
  <BezierEdge
    :source-x="sourceX"
    :source-y="sourceY"
    :target-x="targetX"
    :target-y="targetY"
    :source-position="sourcePosition"
    :target-position="targetPosition"
  />
</template>
