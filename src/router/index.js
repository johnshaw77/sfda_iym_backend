import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/auth/Login.vue"),
    meta: {
      title: "登入",
      guest: true,
    },
  },
  {
    path: "/",
    name: "Layout",
    component: () => import("../layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("../views/Home.vue"),
        meta: {
          title: "首頁",
        },
      },
      {
        path: "workflow/:id?",
        name: "Workflow",
        component: () => import("../views/workflow/index.vue"),
        meta: {
          title: "工作流程",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守衛
router.beforeEach((to, from, next) => {
  // 設置頁面標題
  document.title = `${to.meta.title} - SFDA IYM` || "SFDA IYM";

  // 獲取 token
  const token = localStorage.getItem("token");

  // 需要認證的頁面
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  }
  // 訪客頁面（如登入頁）
  else if (to.matched.some((record) => record.meta.guest)) {
    if (token) {
      next("/");
    } else {
      next();
    }
  }
  // 其他頁面
  else {
    next();
  }
});

export default router;
