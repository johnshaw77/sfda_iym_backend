const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 確保上傳目錄存在
const avatarUploadDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

// 配置儲存
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadDir);
  },
  filename: function (req, file, cb) {
    // 使用用戶名稱 + 時間戳作為檔案名
    const timestamp = Date.now();
    const username = req.user.username.replace(/[^a-zA-Z0-9]/g, "_"); // 移除不安全的字符
    const ext = path.extname(file.originalname);
    const filename = `${username}-${timestamp}${ext}`;
    cb(null, filename);
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
    return cb(new Error("只支援 JPG、PNG、GIF 格式的圖片"), false);
  }

  cb(null, true);
};

// 導出上傳中間件
exports.uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single("avatar");

// 錯誤處理中間件
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "檔案大小不能超過 2MB",
      });
    }
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
