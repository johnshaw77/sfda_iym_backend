const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// 獲取所有用戶列表
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("獲取用戶列表錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 獲取特定用戶信息
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "用戶不存在" });
    }

    res.json(user);
  } catch (error) {
    console.error("獲取用戶信息錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 更新用戶資料（管理員）
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive, password } = req.body;

    // 檢查用戶是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "用戶不存在" });
    }

    // 驗證角色值
    if (role && !["ADMIN", "USER"].includes(role)) {
      return res.status(400).json({ message: "無效的角色值" });
    }

    // 準備更新數據
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 更新用戶資料
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "用戶資料更新成功",
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

// 刪除用戶
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "用戶不存在" });
    }

    // 不允許刪除最後一個管理員
    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "無法刪除最後一個管理員帳號",
        });
      }
    }

    // 刪除用戶
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "用戶已成功刪除" });
  } catch (error) {
    console.error("刪除用戶錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};
