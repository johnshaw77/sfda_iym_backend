/**
 * 檔案相關工具函數
 */

/**
 * 獲取服務器 URL
 * @returns {string} 服務器完整 URL
 */
const getServerUrl = () => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.HOST || "localhost";
  const port = process.env.PORT || 3001;
  return `${protocol}://${host}:${port}`;
};

/**
 * 生成檔案的完整 URL
 * @param {string} serverUrl - 服務器 URL
 * @param {string} filePath - 檔案路徑
 * @returns {string|null} 檔案的完整 URL
 */
const getFileUrl = (serverUrl, filePath) => {
  if (!filePath) return null;
  // 將路徑中的每個部分分別進行 URL 編碼
  const encodedPath = filePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${serverUrl}/${encodedPath}`;
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
  getFileUrl,
  getDecodedFileName,
};
