const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const avatarService = require("../services/avatarService");

const prisma = new PrismaClient();

// 用戶註冊
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.username === username
            ? "用戶名已被使用"
            : "電子郵件已被註冊",
      });
    }

    // 創建新用戶
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
        role: "READER", // 設置預設角色
        userRoles: {
          create: {
            role: {
              connect: {
                name: "READER",
              },
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 添加頭像 URL
    const responseUser = {
      ...user,
      avatar: avatarService.getAvatarUrl(user.avatar),
    };

    res.status(201).json({
      message: "註冊成功",
      token,
      user: responseUser,
    });
  } catch (error) {
    console.error("註冊錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 用戶登入
exports.login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    console.log(email, password, remember);

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("user", user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("電子郵件或密碼錯誤");
      return res.status(401).json({
        message: "電子郵件或密碼錯誤",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "帳號已被停用",
      });
    }

    // 設置過期時間
    let expiresIn = process.env.JWT_EXPIRES_IN;
    if (remember) {
      // 如果選擇記住我，則使用更長的過期時間
      expiresIn = process.env.JWT_REMEMBER_EXPIRES_IN || "7d";
    }

    // 生成 JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // 重組用戶數據
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: avatarService.getAvatarUrl(user.avatar),
      roles: user.userRoles.map((ur) => ({
        name: ur.role.name,
        description: ur.role.description,
        permissions: ur.role.rolePermissions.map((rp) => ({
          name: rp.permission.name,
          description: rp.permission.description,
        })),
      })),
    };

    res.json({
      message: "登入成功",
      token,
      user: userData,
      expiresIn,
    });
  } catch (error) {
    console.error("登入錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 獲取當前用戶信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // 重組權限數據
    const userWithPermissions = {
      ...user,
      avatar: avatarService.getAvatarUrl(user.avatar),
      roles: user.userRoles.map((ur) => ({
        name: ur.role.name,
        description: ur.role.description,
        permissions: ur.role.rolePermissions.map((rp) => ({
          name: rp.permission.name,
          description: rp.permission.description,
        })),
      })),
    };
    delete userWithPermissions.userRoles;

    res.json(userWithPermissions);
  } catch (error) {
    console.error("獲取用戶信息錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 更新用戶資料
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 準備更新數據
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // 如果要更改密碼
    if (newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({
          message: "當前密碼錯誤",
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // 更新用戶資料
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    // 添加頭像 URL
    const responseUser = {
      ...updatedUser,
      avatar: avatarService.getAvatarUrl(updatedUser.avatar),
    };

    res.json({
      message: "資料更新成功",
      user: responseUser,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "用戶名或電子郵件已被使用",
      });
    }
    console.error("更新用戶資料錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

/**
 * 更新用戶頭像(當前登錄的用戶)
 */
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "請選擇要上傳的頭像" });
    }

    try {
      avatarService.validateAvatarFile(file);
    } catch (error) {
      // 驗證失敗時刪除上傳的文件
      await avatarService.deleteFile(file.path);
      return res.status(400).json({ message: error.message });
    }

    const result = await avatarService.uploadAvatar(userId, file);
    console.log("resultdd", result);
    res.json(result);
  } catch (error) {
    console.error("更新頭像失敗:", error);
    // 如果上傳過程中出錯，刪除已上傳的文件
    if (req.file) {
      await avatarService.deleteFile(req.file.path);
    }
    res.status(error.message === "用戶不存在" ? 404 : 500).json({
      message: error.message || "更新頭像失敗",
    });
  }
};

// 用戶登出
exports.logout = async (req, res) => {
  try {
    // 在這裡可以添加任何需要的清理邏輯
    // 例如：清除 session、刪除 refresh token 等

    res.json({ message: "登出成功" });
  } catch (error) {
    console.error("登出錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 修正導出方式
module.exports = {
  register: exports.register,
  login: exports.login,
  getCurrentUser: exports.getCurrentUser,
  updateProfile: exports.updateProfile,
  updateAvatar: exports.updateAvatar,
  logout: exports.logout,
};
