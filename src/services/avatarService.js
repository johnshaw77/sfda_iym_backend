const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { getResourceUrl } = require("../utils/serverUrl");
const { paths, fullPaths, urlPaths } = require("../config/paths");
const prisma = new PrismaClient();

class AvatarService {
  /**
   * 處理頭像上傳
   * @param {string} userId - 用戶ID
   * @param {Express.Multer.File} file - 上傳的文件
   * @returns {Promise<{message: string, user: Object}>}
   */
  async uploadAvatar(userId, file) {
    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // 刪除上傳的文件
      await this.deleteFile(file.path);
      throw new Error("用戶不存在");
    }

    // 如果用戶已有頭像，刪除舊頭像
    if (user.avatar) {
      await this.deleteOldAvatar(user.avatar);
    }

    // 更新用戶頭像路徑（只存檔案名）
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: file.filename },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });

    // 返回更新後的用戶資料，包含完整的頭像 URL
    return {
      message: "頭像上傳成功",
      user: {
        ...updatedUser,
        avatar: this.getAvatarUrl(updatedUser.avatar),
      },
    };
  }

  /**
   * 刪除舊的頭像文件
   * @param {string} filename - 頭像檔案名
   */
  async deleteOldAvatar(filename) {
    if (!filename) return;

    const fullPath = path.join(fullPaths.avatarDir, filename);
    if (fs.existsSync(fullPath)) {
      await this.deleteFile(fullPath);
    }
  }

  /**
   * 刪除文件
   * @param {string} filePath - 文件路徑
   */
  async deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 驗證頭像文件
   * @param {Express.Multer.File} file - 上傳的文件
   * @returns {boolean}
   */
  validateAvatarFile(file) {
    if (!paths.avatar.allowedTypes.includes(file.mimetype)) {
      throw new Error("只允許上傳 JPG、PNG 或 GIF 格式的圖片");
    }

    if (file.size > paths.avatar.maxSize) {
      throw new Error("文件大小不能超過 5MB");
    }

    return true;
  }

  /**
   * 獲取頭像的完整 URL
   * @param {string} filename - 頭像檔案名
   * @returns {string}
   */
  getAvatarUrl(filename) {
    if (!filename) return null;
    return getResourceUrl(`${urlPaths.avatarPrefix}/${filename}`);
  }
}

module.exports = new AvatarService();
