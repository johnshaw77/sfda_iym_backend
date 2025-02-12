<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-[420px] bg-white p-8 rounded-lg shadow-lg">
      <!-- Logo -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-[#1976D2]"></div>
          <span class="text-2xl text-center text-gray-600"
            >IYM良率分析系統</span
          >
        </div>
      </div>

      <!-- 標題 -->
      <h1 class="text-xl font-semibold text-gray-900 mb-2">登入</h1>
      <p class="text-gray-500 text-sm mb-8">歡迎回來！請輸入您的帳號密碼</p>

      <!-- 登入表單 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <!-- 電子郵件 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <el-form-item prop="email" class="mb-0">
            <el-input
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              size="large"
              class="login-input"
            />
          </el-form-item>
        </div>

        <!-- 密碼 -->
        <div class="mb-4 mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >密碼</label
          >
          <el-form-item prop="password" class="mb-0">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              size="large"
              show-password
              class="login-input"
            />
          </el-form-item>
        </div>

        <!-- 記住我和忘記密碼 -->
        <div class="flex items-center justify-between mb-6">
          <el-checkbox v-model="formData.remember" class="remember-me">
            記住我一週
          </el-checkbox>
          <el-link type="primary" @click="handleForgotPassword">
            忘記密碼？
          </el-link>
        </div>

        <!-- 登入按鈕 -->
        <el-button
          type="primary"
          size="large"
          class="w-full mb-4 mt-4 text-lg"
          :loading="loading"
          @click="handleSubmit"
        >
          登 入
        </el-button>

        <!-- Google 登入 -->
        <!-- <el-button
          size="large"
          class="w-full flex items-center justify-center space-x-2 border border-gray-300 hover:border-[#1976D2] hover:text-[#1976D2] transition-colors"
        >
          <img src="@/assets/google.svg" alt="Google" class="w-5 h-5" />
          <span>Sign in with Google</span>
        </el-button> -->

        <!-- 註冊連結 -->
        <!-- <div class="text-center mt-6">
          <p class="text-gray-600 text-sm">
            Don't have an account?
            <el-button
              link
              type="primary"
              class="sign-up-link"
              @click="handleRegister"
            >
              Sign up
            </el-button>
          </p>
        </div> -->
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "@/api";

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const loading = ref(false);

// 表單數據
const formData = reactive({
  email: "",
  password: "",
  remember: false,
});

// 表單驗證規則
const rules = {
  email: [
    { required: true, message: "請輸入電子郵件", trigger: "blur" },
    { type: "email", message: "請輸入有效的電子郵件地址", trigger: "blur" },
  ],
  password: [
    { required: true, message: "請輸入密碼", trigger: "blur" },
    { min: 6, message: "密碼長度至少為 6 個字符", trigger: "blur" },
  ],
};

// 處理登入
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const response = await login({
      email: formData.email,
      password: formData.password,
      remember: formData.remember,
    });

    // 保存 token
    localStorage.setItem("token", response.token);
    // 保存記住我的狀態
    if (formData.remember) {
      localStorage.setItem("remember", "true");
    } else {
      localStorage.removeItem("remember");
    }

    // 如果有重定向地址，則跳轉到重定向地址
    const redirectPath = route.query.redirect || "/";
    router.push(redirectPath);

    ElMessage.success("登入成功");
  } catch (error) {
    console.error("登入錯誤:", error);
    ElMessage.error(error.response?.data?.message || "登入失敗，請稍後再試");
  } finally {
    loading.value = false;
  }
};

// 處理忘記密碼
const handleForgotPassword = () => {
  ElMessage.info("忘記密碼功能開發中");
};

// 處理註冊
const handleRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.login-input :deep(.el-input__wrapper) {
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: none !important;
}

.login-input :deep(.el-input__wrapper):hover {
  border-color: #1976d2;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1) !important;
}

.el-button--primary {
  @apply !bg-[#1976D2] hover:!bg-[#1565C0] !border-none;
  height: 44px;
  border-radius: 8px;
}

.remember-me :deep(.el-checkbox__label) {
  @apply !text-gray-600 text-sm;
}

.sign-up-link {
  @apply !text-[#1976D2] font-medium hover:!text-[#1565C0];
}
</style>
