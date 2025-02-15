const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { logger } = require("../utils/logger");
const { AppError } = require("./errorHandler");

// 確保上傳目錄存在
const avatarUploadDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

/**
 * 生成安全的檔案名
 * @param {string} originalname - 原始檔案名
 * @returns {string} 安全的檔案名
 */
const generateSafeFileName = (originalname) => {
  // 獲取檔案副檔名
  const ext = path.extname(originalname).toLowerCase();
  // 生成時間戳
  const timestamp = Date.now();
  // 生成 6 位隨機字串
  const randomStr = Math.random().toString(36).substring(2, 8);
  // 組合新檔案名：時間戳_隨機字串.副檔名
  return `${timestamp}_${randomStr}${ext}`;
};

// 配置儲存
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadDir);
  },
  filename: function (req, file, cb) {
    // 使用安全的檔案名
    const safeFileName = generateSafeFileName(file.originalname);
    // 保存原始檔案名到 request 中，以便後續處理
    req.originalFileName = file.originalname;
    cb(null, safeFileName);
  },
});

// 檔案過濾器
const fileFilter = (req, file, cb) => {
  // 檢查檔案類型
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("只允許上傳圖片檔案"), false);
  }

  // 允許的檔案類型
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    logger.warn("不支援的文件類型", {
      mimetype: file.mimetype,
      filename: file.originalname,
      userId: req.user?.id,
    });
    return cb(new AppError("只支援 JPG、PNG、GIF 格式的圖片", 400), false);
  }

  cb(null, true);
};

// 創建上傳中間件
const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single("avatar");

// 錯誤處理中間件
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      logger.warn("文件大小超出限制", {
        error: err.message,
        userId: req.user?.id,
      });
      return res.status(400).json({
        message: "檔案大小不能超過 2MB",
      });
    }
    logger.error("文件上傳錯誤", {
      error: err.message,
      code: err.code,
      userId: req.user?.id,
    });
    return res.status(400).json({
      message: "檔案上傳錯誤",
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message,
    });
  }

  next();
};

// 統一導出所有上傳相關功能
module.exports = {
  uploadAvatar,
  handleUploadError,
  generateSafeFileName, // 導出這個函數以便其他模組可能需要使用
};
