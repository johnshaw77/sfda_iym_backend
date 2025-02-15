const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

/**
 * 獲取所有用戶
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 過濾敏感資訊並轉換 isActive 為 status
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.isActive ? "active" : "inactive",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      userRoles: user.userRoles,
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error("獲取用戶列表失敗:", error);
    res.status(500).json({ message: "獲取用戶列表失敗" });
  }
};

/**
 * 獲取特定用戶
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "用戶不存在" });
    }

    // 過濾敏感資訊並轉換 isActive 為 status
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.isActive ? "active" : "inactive",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      userRoles: user.userRoles,
    };

    res.json(safeUser);
  } catch (error) {
    console.error("獲取用戶資料失敗:", error);
    res.status(500).json({ message: "獲取用戶資料失敗" });
  }
};

/**
 * 創建用戶
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, status = "active" } = req.body;

    // 檢查用戶名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "用戶名或郵箱已存在" });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建用戶，將 status 轉換為 isActive
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isActive: status === "active",
      },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 轉換回傳的資料格式
    const responseUser = {
      ...user,
      status: user.isActive ? "active" : "inactive",
    };
    delete responseUser.isActive;

    res.status(201).json(responseUser);
  } catch (error) {
    console.error("創建用戶失敗:", error);
    res.status(500).json({ message: "創建用戶失敗" });
  }
};

/**
 * 更新用戶
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, status } = req.body;

    // 檢查用戶是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "用戶不存在" });
    }

    // 檢查用戶名和郵箱是否與其他用戶重複
    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        NOT: {
          id,
        },
      },
    });

    if (duplicateUser) {
      return res.status(400).json({ message: "用戶名或郵箱已被其他用戶使用" });
    }

    // 更新用戶，將 status 轉換為 isActive
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        isActive: status === "active",
      },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 轉換回傳的資料格式
    const responseUser = {
      ...updatedUser,
      status: updatedUser.isActive ? "active" : "inactive",
    };
    delete responseUser.isActive;

    res.json(responseUser);
  } catch (error) {
    console.error("更新用戶失敗:", error);
    res.status(500).json({ message: "更新用戶失敗" });
  }
};

/**
 * 刪除用戶
 */
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

    // 刪除用戶的角色關聯
    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // 刪除用戶
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "用戶已刪除" });
  } catch (error) {
    console.error("刪除用戶失敗:", error);
    res.status(500).json({ message: "刪除用戶失敗" });
  }
};

/**
 * 獲取用戶的角色
 */
exports.getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    res.json(userRoles);
  } catch (error) {
    console.error("獲取用戶角色失敗:", error);
    res.status(500).json({ message: "獲取用戶角色失敗" });
  }
};

/**
 * 為用戶分配角色
 */
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    // 檢查用戶和角色是否存在
    const [user, role] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.role.findUnique({ where: { id: roleId } }),
    ]);

    if (!user || !role) {
      return res.status(404).json({ message: "用戶或角色不存在" });
    }

    // 檢查是否已分配
    const existingAssignment = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (existingAssignment) {
      return res.status(400).json({ message: "該角色已分配給此用戶" });
    }

    // 創建角色分配
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: true,
      },
    });

    res.status(201).json(userRole);
  } catch (error) {
    console.error("分配角色失敗:", error);
    res.status(500).json({ message: "分配角色失敗" });
  }
};

/**
 * 移除用戶的角色
 */
exports.removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // 檢查分配是否存在
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (!userRole) {
      return res.status(404).json({ message: "該用戶未分配此角色" });
    }

    // 刪除角色分配
    await prisma.userRole.delete({
      where: {
        id: userRole.id,
      },
    });

    res.json({ message: "角色已移除" });
  } catch (error) {
    console.error("移除角色失敗:", error);
    res.status(500).json({ message: "移除角色失敗" });
  }
};
