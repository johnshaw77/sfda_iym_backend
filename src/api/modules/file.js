import { request } from "../request";

/**
 * 檔案相關 API
 */

/**
 * 上傳檔案
 * @param {File} file - 要上傳的檔案
 * @returns {Promise} - 上傳結果
 */
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await request.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("檔案上傳失敗：", error);
    throw error;
  }
};

/**
 * 獲取檔案列表
 * @returns {Promise} - 檔案列表
 */
export const getFiles = () => request.get("/files");

/**
 * 刪除檔案
 * @param {string} fileId - 檔案ID
 * @returns {Promise} - 刪除結果
 */
export const deleteFile = (fileId) => request.delete(`/files/${fileId}`);

/**
 * 下載檔案
 * @param {string} fileId - 檔案ID
 * @returns {Promise} - 下載結果
 */
export const downloadFile = (fileId) =>
  request.download(`/files/${fileId}/download`);
