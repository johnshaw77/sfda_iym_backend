<template>
  <el-dialog v-model="dialogVisible" title="新建分析" width="500px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="分析名稱">
        <el-input v-model="form.name" placeholder="請輸入分析名稱" />
      </el-form-item>
      <el-form-item label="分析類型">
        <el-select
          v-model="form.type"
          placeholder="請選擇分析類型"
          class="w-full"
        >
          <el-option label="相關性分析" value="correlation" />
          <el-option label="回歸分析" value="regression" />
          <el-option label="分類分析" value="classification" />
          <el-option label="聚類分析" value="clustering" />
        </el-select>
      </el-form-item>
      <el-form-item label="數據來源">
        <el-select
          v-model="form.dataSource"
          placeholder="請選擇數據來源"
          class="w-full"
        >
          <el-option label="製程數據A" value="process_a" />
          <el-option label="製程數據B" value="process_b" />
          <el-option label="檢驗數據" value="inspection" />
        </el-select>
      </el-form-item>
      <el-form-item label="備註">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="請輸入備註"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">確定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const form = ref({
  name: "",
  type: "",
  dataSource: "",
  description: "",
});

const handleClose = () => {
  dialogVisible.value = false;
};

const handleSubmit = () => {
  emit("submit", { ...form.value });
  dialogVisible.value = false;
};
</script>
