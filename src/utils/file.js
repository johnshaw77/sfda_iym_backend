/**
 * 檔案相關工具函數
 */

const fs = require("fs");
const path = require("path");
const { getResourceUrl, getServerUrl, getFileUrl } = require("./serverUrl");

/**
 * 檢查目錄是否存在，不存在則創建
 * @param {string} dirPath - 目錄路徑
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * 刪除文件
 * @param {string} filePath - 文件路徑
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 獲取文件的完整路徑
 * @param {string} relativePath - 相對路徑
 * @returns {string} 完整路徑
 */
const getFullPath = (relativePath) => {
  return path.join(__dirname, "../../", relativePath);
};

/**
 * 獲取文件的 URL
 * @param {string} filePath - 文件路徑
 * @returns {string|null} 文件的完整 URL
 */
// const getFileUrl = (filePath) => {
//   return getResourceUrl(filePath);
// };

/**
 * 檢查文件是否存在
 * @param {string} filePath - 文件路徑
 * @returns {boolean}
 */
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

/**
 * 獲取文件大小
 * @param {string} filePath - 文件路徑
 * @returns {number} 文件大小（bytes）
 */
const getFileSize = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.size;
};

/**
 * 獲取文件擴展名
 * @param {string} filePath - 文件路徑
 * @returns {string} 文件擴展名
 */
const getFileExtension = (filePath) => {
  return path.extname(filePath).toLowerCase();
};

/**
 * 驗證文件類型
 * @param {string} filePath - 文件路徑
 * @param {string[]} allowedExtensions - 允許的擴展名列表
 * @returns {boolean}
 */
const validateFileType = (filePath, allowedExtensions) => {
  const extension = getFileExtension(filePath);
  return allowedExtensions.includes(extension);
};

/**
 * 驗證文件大小
 * @param {string} filePath - 文件路徑
 * @param {number} maxSize - 最大允許大小（bytes）
 * @returns {boolean}
 */
const validateFileSize = (filePath, maxSize) => {
  const size = getFileSize(filePath);
  return size <= maxSize;
};

/**
 * 生成唯一的文件名
 * @param {string} originalName - 原始文件名
 * @returns {string} 唯一文件名
 */
const generateUniqueFileName = (originalName) => {
  const extension = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}${extension}`;
};

/**
 * 解碼檔案名稱
 * @param {string} filename - 檔案名稱
 * @returns {string} 解碼後的檔案名稱
 */
const getDecodedFileName = (filename) => {
  if (!filename) return "";
  try {
    // 嘗試將 latin1 編碼的檔案名轉換為 UTF-8
    return Buffer.from(filename, "latin1").toString("utf8");
  } catch {
    return filename;
  }
};

module.exports = {
  getServerUrl,
  ensureDirectoryExists,
  deleteFile,
  getFullPath,
  fileExists,
  getFileSize,
  getFileExtension,
  validateFileType,
  validateFileSize,
  generateUniqueFileName,
  getDecodedFileName,
};
