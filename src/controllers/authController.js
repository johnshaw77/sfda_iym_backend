const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

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

    res.status(201).json({
      message: "註冊成功",
      token,
      user,
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
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

    res.json({
      message: "資料更新成功",
      user: updatedUser,
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

// 更新用戶頭像
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "請選擇要上傳的頭像",
      });
    }

    // 獲取檔案相對路徑
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // 獲取當前用戶資訊，包含舊的頭像路徑
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true },
    });

    // 更新用戶頭像
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar: avatarPath,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    // 如果有舊的頭像檔案，刪除它
    if (currentUser?.avatar) {
      const oldAvatarPath = path.join(__dirname, "../..", currentUser.avatar);
      // 確保不是預設頭像
      if (
        fs.existsSync(oldAvatarPath) &&
        !oldAvatarPath.includes("default-avatar")
      ) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    res.json({
      message: "頭像更新成功",
      user,
    });
  } catch (error) {
    console.error("更新頭像錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};
