/**
 * 獲取伺服器 URL 配置
 * @returns {Object} 包含伺服器 URL 相關的配置
 */
const getServerConfig = () => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.HOST || "localhost";
  const port = process.env.PORT || 3001;
  const baseUrl = process.env.API_URL || `${protocol}://${host}:${port}`;

  return {
    protocol,
    host,
    port,
    baseUrl,
  };
};

/**
 * 獲取完整的伺服器 URL
 * @param {string} path - 相對路徑
 * @returns {string} 完整的 URL
 */
const getServerUrl = (path = "") => {
  const { baseUrl } = getServerConfig();
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
};

/**
 * 獲取資源的完整 URL
 * @param {string} resourcePath - 資源的相對路徑
 * @returns {string|null} 資源的完整 URL，如果路徑不存在則返回 null
 */
const getResourceUrl = (resourcePath) => {
  if (!resourcePath) return null;
  return getServerUrl(resourcePath);
};

/**
 * 生成檔案的完整 URL
 * @param {string} serverUrl - 服務器 URL
 * @param {string} filePath - 檔案路徑
 * @returns {string|null} 檔案的完整 URL
 */
const getFileUrl = (serverUrl, filePath) => {
  console.log("serverUrl", serverUrl, "---", filePath);
  if (!filePath) return null;
  // 將路徑中的每個部分分別進行 URL 編碼
  const encodedPath = filePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${serverUrl}/${encodedPath}`;
};

module.exports = {
  getServerConfig,
  getServerUrl,
  getResourceUrl,
  getFileUrl,
};
