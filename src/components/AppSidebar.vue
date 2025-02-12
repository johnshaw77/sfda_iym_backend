<template>
  <div class="sidebar-wrapper">
    <el-menu
      class="sidebar-menu"
      :default-active="route.path"
      :collapse="isCollapse"
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#409EFF"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
        @click="$router.push(item.path)"
      >
        <component :is="item.icon" :size="24" />
        <template #title>
          <span class="menu-title">{{ item.title }}</span>
        </template>
      </el-menu-item>
    </el-menu>

    <!-- 折疊按鈕 -->
    <el-button type="text" class="collapse-button" @click="toggleCollapse">
      <component :is="isCollapse ? ChevronRight : ChevronLeft" :size="16" />
    </el-button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  GitGraph,
  FileText,
  LineChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);

// 從路由配置生成選單項目
const menuItems = computed(() => {
  return router.options.routes
    .filter((route) => !route.redirect && route.name && !route.meta?.guest)
    .map((route) => ({
      path: route.path,
      name: route.name,
      icon: getMenuIcon(route.path),
      title: getMenuTitle(route.path),
    }));
});

// 根據路徑獲取對應的圖標
const getMenuIcon = (path) => {
  const icons = {
    "/projects": FolderKanban,
    "/workflow": GitGraph,
    "/workflow-test": GitGraph,
    "/files": FileText,
    "/analysis": LineChart,
    "/settings": Settings,
  };
  return icons[path] || Settings;
};

// 根據路徑獲取對應的標題
const getMenuTitle = (path) => {
  const titles = {
    "/projects": "專案管理",
    "/workflow": "工作流程",
    "/workflow-test": "工作流測試",
    "/files": "文件管理",
    "/analysis": "數據分析",
    "/settings": "系統設置",
  };
  return titles[path] || path;
};

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

defineExpose({
  isCollapse,
});
</script>

<style scoped>
.sidebar-wrapper {
  @apply relative;
}

.sidebar-menu {
  @apply fixed left-0 top-12 bottom-0 border-r border-slate-200;
  transition: width 0.2s ease-in-out;
}

.collapse-button {
  @apply fixed z-20 !w-4 !h-4 !p-0 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-blue-500;
  left: 236px;
  top: 72px;
  transform: translateX(-50%);
  /* transition: all 0.2s ease-in-out; */
}

/* 當選單收合時，按鈕也要跟著移動 */
:deep(.el-menu--collapse) + .collapse-button {
  left: 78px;
}

.el-menu--vertical:not(.el-menu--collapse) {
  @apply !w-48;
}

.el-menu--collapse {
  @apply !w-16;
}

/* 為選單項目添加過渡效果 */
:deep(.el-menu-item) {
  @apply !border-l-4 !border-transparent;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}

:deep(.el-menu-item.is-active) {
  @apply !border-l-4 !border-blue-500 !bg-blue-50;
}

:deep(.el-menu-item:hover) {
  @apply !bg-gray-50;
}

/* 為選單文字添加過渡效果 */
:deep(.menu-title) {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

:deep(.el-menu--collapse .menu-title) {
  opacity: 0;
  width: 0;
  display: inline-block;
}

/* 為圖標添加過渡效果 */
:deep(.el-menu-item svg) {
  transition: margin 0.2s ease-in-out;
}
</style>
