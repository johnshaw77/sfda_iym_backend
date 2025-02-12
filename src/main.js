import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import zhTw from "element-plus/dist/locale/zh-tw.mjs";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 配置 NProgress
NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 引入 Lucide Icons
import {
  LineChart,
  FileText,
  Settings,
  Plus,
  User,
  Upload,
  Cog,
  Table,
  ClipboardCheck,
  X,
  Bell,
  UserCircle,
  GitGraph,
  Download,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";

// 路由配置
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("./views/auth/Login.vue"),
    meta: {
      guest: true,
      layout: "blank",
    },
  },
  {
    path: "/",
    redirect: "/projects",
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("./views/projects/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: () => import("./views/workflow/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: "/files",
    name: "Files",
    component: () => import("./views/files/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: "/analysis",
    name: "Analysis",
    component: () => import("./views/analysis/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("./views/settings/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: "/api-test",
    name: "ApiTest",
    component: () => import("./views/api-test/index.vue"),
    meta: {
      keepAlive: true,
    },
  },

  // {
  //   path: "/workflow-test",
  //   name: "WorkflowTest",
  //   component: () => import("./views/workflow-test/index.vue"),
  //   meta: {
  //     keepAlive: true,
  //   },
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守衛
router.beforeEach((to, from, next) => {
  NProgress.start();

  // 檢查是否需要認證
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuest = to.matched.some((record) => record.meta.guest);
  const token = localStorage.getItem("token");

  if (requiresAuth && !token) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else if (isGuest && token) {
    next("/");
  } else {
    next();
  }
});

router.afterEach(() => {
  NProgress.done();
});

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhTw,
});
app.use(router);

// 註冊 Lucide 圖標
const icons = {
  LineChart,
  FileText,
  Settings,
  Plus,
  User,
  Upload,
  Cog,
  Table,
  ClipboardCheck,
  X,
  Bell,
  UserCircle,
  GitGraph,
  Download,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
};

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

app.mount("#app");
