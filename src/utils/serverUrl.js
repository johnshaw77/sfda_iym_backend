/**
 * 獲取伺服器 URL 配置
 * @returns {Object} 包含伺服器 URL 相關的配置
 */
const getServerConfig = () => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.HOST || "localhost";
  const port = process.env.PORT || 3000;
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

module.exports = {
  getServerConfig,
  getServerUrl,
  getResourceUrl,
};
