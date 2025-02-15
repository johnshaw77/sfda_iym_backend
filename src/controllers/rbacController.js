const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 角色相關控制器
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      message: "角色創建成功",
      role,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "角色名稱已存在",
      });
    }
    console.error("創建角色錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};
// 獲取所有角色列表
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.json(roles);
  } catch (error) {
    console.error("獲取角色列表錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 更新角色
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.json({
      message: "角色更新成功",
      role,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "角色名稱已存在",
      });
    }
    console.error("更新角色錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 刪除角色
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.role.delete({
      where: { id },
    });

    res.json({ message: "角色刪除成功" });
  } catch (error) {
    console.error("刪除角色錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 權限相關控制器
exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      message: "權限創建成功",
      permission,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "權限名稱已存在",
      });
    }
    console.error("創建權限錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 獲取所有權限列表
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (error) {
    console.error("獲取權限列表錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 角色權限關聯控制器
exports.assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    // 檢查角色和權限是否存在
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!role || !permission) {
      return res.status(404).json({
        message: !role ? "角色不存在" : "權限不存在",
      });
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        role: {
          connect: { id: roleId },
        },
        permission: {
          connect: { id: permissionId },
        },
      },
      include: {
        role: true,
        permission: true,
      },
    });

    res.status(201).json({
      message: "權限分配成功",
      rolePermission,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "該角色已擁有此權限",
      });
    }
    console.error("分配權限錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 移除權限從角色
exports.removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    res.json({ message: "權限移除成功" });
  } catch (error) {
    console.error("移除權限錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 用戶角色關聯控制器
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        user: true,
        role: true,
      },
    });

    res.status(201).json({
      message: "角色分配成功",
      userRole,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "用戶已擁有此角色",
      });
    }
    console.error("分配角色錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 移除角色從用戶
exports.removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    res.json({ message: "角色移除成功" });
  } catch (error) {
    console.error("移除角色錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};
