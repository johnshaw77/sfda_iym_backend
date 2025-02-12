import request from "@/api/request";

/**
 * 認證相關 API
 * 包含登入、註冊、token 驗證等功能
 */

/**
 * 用戶登入
 * @param {Object} data - 登入資料
 * @param {string} data.email - 用戶電子郵件
 * @param {string} data.password - 用戶密碼
 * @returns {Promise<{token: string, user: Object}>} 返回包含 token 和用戶資料的響應
 */
export function login(data) {
  return request({
    url: "/auth/login",
    method: "post",
    data,
  });
}

/**
 * 用戶註冊
 * @param {Object} data - 註冊資料
 * @param {string} data.email - 用戶電子郵件
 * @param {string} data.password - 用戶密碼
 * @param {string} data.username - 用戶名稱
 * @returns {Promise<{token: string, user: Object}>} 返回包含 token 和用戶資料的響應
 */
export function register(data) {
  return request({
    url: "/auth/register",
    method: "post",
    data,
  });
}

/**
 * 驗證 token 並獲取當前用戶資料
 * @returns {Promise<Object>} 返回用戶資料
 */
export function verifyToken() {
  return request({
    url: "/auth/verify",
    method: "get",
  });
}

/**
 * 登出
 * @returns {Promise<void>}
 */
export function logout() {
  return request({
    url: "/auth/logout",
    method: "post",
  });
}

/**
 * 重設密碼請求
 * @param {Object} data - 重設密碼資料
 * @param {string} data.email - 用戶電子郵件
 * @returns {Promise<{message: string}>} 返回操作結果
 */
export function requestPasswordReset(data) {
  return request({
    url: "/auth/password/reset-request",
    method: "post",
    data,
  });
}

/**
 * 重設密碼
 * @param {Object} data - 重設密碼資料
 * @param {string} data.token - 重設密碼 token
 * @param {string} data.password - 新密碼
 * @returns {Promise<{message: string}>} 返回操作結果
 */
export function resetPassword(data) {
  return request({
    url: "/auth/password/reset",
    method: "post",
    data,
  });
}
