import { request } from "../request";

/**
 * 工作流程相關 API
 */

/**
 * 上傳工作流程檔案
 * @param {File} file - 要上傳的檔案
 * @param {string} workflowId - 工作流程 ID
 * @returns {Promise} - 上傳結果
 */
export const uploadWorkflowFile = async (file, workflowId) => {
  console.log("workflowId***", workflowId);
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workflowId", workflowId);
    console.log("formData", formData, workflowId);
    const response = await request.post("/files/upload/workflow", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("response", response);

    return response;
  } catch (error) {
    console.error("工作流程檔案上傳失敗：", error);
    throw error;
  }
};

// 獲取工作流程的檔案列表
export const getWorkflowFiles = (workflowId) =>
  request.get(`/workflow/${workflowId}/files`);

// 刪除檔案
export const deleteWorkflowFile = (fileId) =>
  request.delete(`/workflow/files/${fileId}`);

// 下載檔案
export const downloadWorkflowFile = (fileId) =>
  request.download(`/workflow/files/${fileId}/download`);
