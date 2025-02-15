const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { logger } = require("../utils/logger");

const DEFAULT_PERMISSIONS = [
  {
    name: "MANAGE_ROLES",
    description: "管理角色（創建、修改、刪除角色）",
  },
  {
    name: "MANAGE_PERMISSIONS",
    description: "管理權限（創建、修改權限）",
  },
  {
    name: "ASSIGN_ROLES",
    description: "分配角色給用戶",
  },
  {
    name: "VIEW_ROLES",
    description: "查看角色列表",
  },
  {
    name: "VIEW_PERMISSIONS",
    description: "查看權限列表",
  },
  {
    name: "MANAGE_USERS",
    description: "管理用戶（創建、修改、刪除用戶）",
  },
  {
    name: "VIEW_USERS",
    description: "查看用戶列表",
  },
  {
    name: "MANAGE_PROJECTS",
    description: "管理專案（創建、修改、刪除專案）",
  },
  {
    name: "VIEW_PROJECTS",
    description: "查看專案列表",
  },
];

const DEFAULT_ROLES = [
  {
    name: "SUPER_ADMIN",
    description: "超級管理員，擁有所有權限",
    permissions: ["*"], // 所有權限
  },
  {
    name: "ADMIN",
    description: "管理員",
    permissions: [
      "MANAGE_USERS",
      "VIEW_USERS",
      "MANAGE_PROJECTS",
      "VIEW_PROJECTS",
      "ASSIGN_ROLES",
      "VIEW_ROLES",
      "VIEW_PERMISSIONS",
    ],
  },
  {
    name: "USER",
    description: "普通用戶",
    permissions: ["VIEW_PROJECTS"],
  },
];

async function initializeRBAC() {
  try {
    logger.info("開始初始化 RBAC 系統...");

    // 創建默認權限
    for (const permission of DEFAULT_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: permission,
      });
    }
    logger.info("權限初始化完成");

    // 創建默認角色
    for (const role of DEFAULT_ROLES) {
      const { permissions, ...roleData } = role;
      const createdRole = await prisma.role.upsert({
        where: { name: roleData.name },
        update: { description: roleData.description },
        create: roleData,
      });

      // 如果是超級管理員，賦予所有權限
      if (permissions[0] === "*") {
        const allPermissions = await prisma.permission.findMany();
        for (const permission of allPermissions) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: createdRole.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          });
        }
      } else {
        // 為角色分配指定的權限
        const dbPermissions = await prisma.permission.findMany({
          where: { name: { in: permissions } },
        });

        for (const permission of dbPermissions) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: createdRole.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
    logger.info("角色初始化完成");

    logger.info("RBAC 系統初始化完成");
  } catch (error) {
    logger.error("RBAC 系統初始化失敗:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  initializeRBAC()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("初始化失敗:", error);
      process.exit(1);
    });
}

module.exports = initializeRBAC;
