/**
 * 系統路徑配置
 */

const path = require("path");

// 基礎路徑配置
const paths = {
  // 上傳文件根目錄（相對於專案根目錄）
  uploadsRoot: "uploads",

  // 頭像相關路徑
  avatar: {
    relativePath: "avatars", // 相對於 uploadsRoot 的路徑
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

// 計算完整路徑
const fullPaths = {
  // 上傳根目錄的完整路徑
  uploadsRoot: path.join(__dirname, "../../", paths.uploadsRoot),

  // 頭像目錄的完整路徑
  avatarDir: path.join(
    __dirname,
    "../../",
    paths.uploadsRoot,
    paths.avatar.relativePath
  ),
};

// URL 路徑
const urlPaths = {
  // 頭像的 URL 路徑前綴
  avatarPrefix: `/${paths.uploadsRoot}/${paths.avatar.relativePath}`,
};

module.exports = {
  paths,
  fullPaths,
  urlPaths,
};
