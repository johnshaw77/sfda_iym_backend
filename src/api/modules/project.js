import request from "@/api/request";

/**
 * 專案相關 API
 */

/**
 * 獲取專案列表
 * @returns {Promise<Array>} 返回專案列表
 */
export function getProjects() {
  return request({
    url: "/projects",
    method: "get",
  });
}

/**
 * 獲取特定專案
 * @param {string} id - 專案ID
 * @returns {Promise<Object>} 返回專案詳情
 */
export function getProject(id) {
  return request({
    url: `/projects/${id}`,
    method: "get",
  });
}

/**
 * 創建專案
 * @param {Object} data - 專案資料
 * @param {string} data.name - 專案名稱
 * @param {string} [data.description] - 專案描述
 * @param {string} [data.status] - 專案狀態
 * @returns {Promise<Object>} 返回創建的專案
 */
export function createProject(data) {
  return request({
    url: "/projects",
    method: "post",
    data,
  });
}

/**
 * 更新專案
 * @param {string} id - 專案ID
 * @param {Object} data - 更新資料
 * @returns {Promise<Object>} 返回更新後的專案
 */
export function updateProject(id, data) {
  return request({
    url: `/projects/${id}`,
    method: "put",
    data,
  });
}

/**
 * 刪除專案
 * @param {string} id - 專案ID
 * @returns {Promise<Object>} 返回操作結果
 */
export function deleteProject(id) {
  return request({
    url: `/projects/${id}`,
    method: "delete",
  });
}
