<template>
  <div class="p-2">
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <!-- 新增專案卡片 -->
      <div
        class="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors duration-200"
        @click="handleCreateProject"
      >
        <Plus :size="32" class="text-gray-400" />
        <span class="mt-4 text-gray-600">新增專案</span>
      </div>

      <!-- 專案卡片列表 -->
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">
                {{ project.name }}
              </h3>
              <p class="mt-2 text-sm text-gray-600 line-clamp-2">
                {{ project.description }}
              </p>
            </div>
            <el-dropdown trigger="click">
              <MoreVertical
                :size="20"
                class="text-gray-400 cursor-pointer hover:text-gray-600"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEditProject(project)"
                    >編輯</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="handleDeleteProject(project)"
                    class="text-red-500"
                  >
                    刪除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="mt-4">
            <div class="flex items-center text-sm text-gray-500">
              <Calendar :size="16" class="mr-2" />
              <span>更新於 {{ formatDate(project.updatedAt) }}</span>
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <User :size="16" class="mr-2" />
              <span>{{ project.creator.username }}</span>
            </div>
          </div>

          <el-divider />
          <div class="mt-4 flex items-center justify-between">
            <el-tag :type="getStatusType(project.status)" size="small">
              {{ getStatusText(project.status) }}
            </el-tag>
            <el-button type="primary" link @click="handleViewProject(project)">
              開啟專案
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯專案對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯專案' : '新增專案'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="專案名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入專案名稱" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入專案描述"
          />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select v-model="form.status" class="w-full">
            <el-option label="草稿" value="draft" />
            <el-option label="進行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Plus, MoreVertical, Calendar, User } from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/api/modules/project";

// 狀態
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const projects = ref([]);

// 表單相關
const formRef = ref(null);
const form = ref({
  id: "",
  name: "",
  description: "",
  status: "draft",
});

// 表單驗證規則
const rules = {
  name: [{ required: true, message: "請輸入專案名稱", trigger: "blur" }],
  description: [{ required: true, message: "請輸入專案描述", trigger: "blur" }],
  status: [{ required: true, message: "請選擇專案狀態", trigger: "change" }],
};

// 獲取專案列表
const fetchProjects = async () => {
  try {
    loading.value = true;
    projects.value = await getProjects();
  } catch (error) {
    console.error("獲取專案列表失敗:", error);
    ElMessage.error("獲取專案列表失敗");
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 獲取狀態標籤類型
const getStatusType = (status) => {
  const types = {
    draft: "info",
    in_progress: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return types[status] || "info";
};

// 獲取狀態文字
const getStatusText = (status) => {
  const texts = {
    draft: "草稿",
    in_progress: "進行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

// 處理新增專案
const handleCreateProject = () => {
  isEdit.value = false;
  form.value = {
    name: "",
    description: "",
    status: "draft",
  };
  dialogVisible.value = true;
};

// 處理編輯專案
const handleEditProject = (project) => {
  isEdit.value = true;
  form.value = {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
  };
  dialogVisible.value = true;
};

// 處理查看專案
const handleViewProject = (project) => {
  // TODO: 實現查看專案詳情
  ElMessage.info("查看專案功能開發中");
};

// 處理刪除專案
const handleDeleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此專案嗎？此操作不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteProject(project.id);
    ElMessage.success("專案刪除成功");
    fetchProjects();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除專案失敗:", error);
      ElMessage.error("刪除專案失敗");
    }
  }
};

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value) {
      await updateProject(form.value.id, {
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      });
      ElMessage.success("專案更新成功");
    } else {
      await createProject({
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      });
      ElMessage.success("專案創建成功");
    }

    dialogVisible.value = false;
    fetchProjects();
  } catch (error) {
    console.error("提交失敗:", error);
    ElMessage.error(error.response?.data?.message || "操作失敗");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
