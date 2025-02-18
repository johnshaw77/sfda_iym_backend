const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const nodeDefinitions = require("./seeds/nodeDefinitions");
const prisma = new PrismaClient();

async function createWorkflowTemplates(prisma, createdUsers) {
  console.log("開始創建工作流程範本...");

  const templateCategories = [
    "品質管理",
    "生產管理",
    "設備管理",
    "人力資源",
    "供應鏈管理",
  ];

  const templateNames = [
    "客訴處理流程",
    "品質檢驗流程",
    "生產計劃審核",
    "設備維護流程",
    "物料申請流程",
    "人員培訓流程",
    "產品研發流程",
    "供應商評估",
    "庫存盤點流程",
    "出貨檢驗流程",
    "設備校準流程",
    "文件審核流程",
    "安全檢查流程",
    "環境監測流程",
    "產品追溯流程",
    "客戶回饋處理",
    "生產異常處理",
    "品質改善計劃",
    "設備保養計劃",
    "工程變更流程",
  ];

  const templateDescriptions = [
    "處理客戶投訴和意見回饋的標準流程",
    "產品品質檢驗和測試的標準作業程序",
    "生產計劃的審核和核准流程",
    "設備定期維護和檢查的標準流程",
    "物料申請和審批的標準作業程序",
    "員工培訓和技能提升的標準流程",
    "新產品研發和測試的標準流程",
    "供應商選擇和評估的標準程序",
    "定期庫存盤點的標準作業流程",
    "產品出貨前的品質檢驗流程",
    "設備定期校準的標準作業程序",
    "文件審核和核准的標準流程",
    "工作場所安全檢查的標準程序",
    "環境參數監測的標準作業流程",
    "產品生產過程追溯的標準程序",
    "客戶意見收集和處理的流程",
    "生產異常情況處理的標準程序",
    "品質持續改善計劃的執行流程",
    "設備定期保養的標準作業程序",
    "工程變更管理的標準流程",
  ];

  const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  const versions = ["1.0.0", "1.0.1", "1.1.0", "2.0.0"];

  for (let i = 0; i < templateNames.length; i++) {
    const randomUser =
      Object.values(createdUsers)[
        Math.floor(Math.random() * Object.values(createdUsers).length)
      ];

    // 創建工作流程範本
    const template = await prisma.workflowTemplate.create({
      data: {
        templateName: templateNames[i],
        description: templateDescriptions[i],
        templateCategory: templateCategories[Math.floor(i / 4)],
        version: versions[Math.floor(Math.random() * versions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        config: JSON.stringify({
          layout: "horizontal",
          theme: "light",
          snapToGrid: true,
          gridSize: 20,
        }),
        creator: {
          connect: {
            id: randomUser.id,
          },
        },
      },
    });

    // 創建節點範本
    const nodes = [
      {
        type: "complaint-selector",
        position: { x: 100, y: 100 },
        data: { label: "選擇客訴單號" },
        nodeName: "客訴單號選擇器",
      },
      {
        type: "defect-item-selector",
        position: { x: 300, y: 100 },
        data: { label: "選擇不良品項" },
        nodeName: "不良品項選擇",
      },
      {
        type: "basic-statistics",
        position: { x: 500, y: 100 },
        data: { label: "基礎統計分析" },
        nodeName: "統計分析",
      },
    ];

    const createdNodes = [];
    for (const node of nodes) {
      const nodeTemplate = await prisma.nodeTemplate.create({
        data: {
          positionX: node.position.x,
          positionY: node.position.y,
          config: JSON.stringify(node.data),
          nodeName: node.nodeName,
          workflowTemplate: {
            connect: {
              id: template.id,
            },
          },
          nodeType: {
            connect: {
              definitionKey: node.type,
            },
          },
        },
      });
      createdNodes.push(nodeTemplate);
    }

    // 創建節點連接
    for (let j = 0; j < createdNodes.length - 1; j++) {
      await prisma.nodeTemplateConnection.create({
        data: {
          edgeType: "default",
          workflowTemplate: {
            connect: {
              id: template.id,
            },
          },
          sourceNode: {
            connect: {
              id: createdNodes[j].id,
            },
          },
          targetNode: {
            connect: {
              id: createdNodes[j + 1].id,
            },
          },
        },
      });
    }

    console.log(`已創建工作流程範本: ${template.templateName}`);
  }
}

async function main() {
  // 清理現有數據（注意順序以避免外鍵約束問題）
  console.log("開始清理現有數據...");

  // 1. 刪除工作流程實例相關
  await prisma.nodeInstanceConnection.deleteMany();
  await prisma.nodeInstance.deleteMany();
  await prisma.workflowInstance.deleteMany();

  // 2. 刪除工作流程範本相關
  await prisma.nodeTemplateConnection.deleteMany();
  await prisma.nodeTemplate.deleteMany();
  await prisma.workflowTemplate.deleteMany();

  // 3. 刪除檔案和日誌相關
  await prisma.fileNode.deleteMany();
  await prisma.apiLog.deleteMany();
  await prisma.file.deleteMany();

  // 4. 刪除資料快照
  await prisma.dataSnapshot.deleteMany();

  // 5. 刪除工作流程
  await prisma.workflow.deleteMany();

  // 6. 刪除專案和系統代碼
  await prisma.project.deleteMany();
  await prisma.systemCode.deleteMany();

  // 7. 刪除節點定義
  await prisma.nodeDefinition.deleteMany();

  // 8. 刪除角色權限關聯
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();

  // 9. 刪除權限和角色
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // 10. 最後刪除用戶
  await prisma.user.deleteMany();

  console.log("數據清理完成");

  // 創建基本角色
  console.log("開始創建基本角色...");
  const roles = [
    { name: "SUPERADMIN", description: "超級管理員，擁有所有權限且不受限制" },
    { name: "ADMIN", description: "系統管理員，擁有所有權限" },
    { name: "POWERUSER", description: "進階用戶，可以創建和管理工作流程" },
    { name: "READER", description: "一般用戶，只能查看和執行工作流程" },
  ];

  const createdRoles = {};
  for (const role of roles) {
    createdRoles[role.name] = await prisma.role.create({
      data: role,
    });
  }

  // 創建基本權限
  const permissions = [
    { name: "VIEW_PROJECTS", description: "查看專案列表" },
    { name: "CREATE_PROJECTS", description: "創建新專案" },
    { name: "EDIT_PROJECTS", description: "編輯專案" },
    { name: "DELETE_PROJECTS", description: "刪除專案" },
    { name: "MANAGE_ROLES", description: "管理角色" },
    { name: "VIEW_ROLES", description: "查看角色" },
    { name: "VIEW_PERMISSIONS", description: "查看權限" },
    { name: "ASSIGN_ROLES", description: "分配角色" },
    { name: "VIEW_NODE_DEFINITIONS", description: "查看節點定義" },
    { name: "MANAGE_NODE_DEFINITIONS", description: "管理節點定義" },
    { name: "SYSTEM_ADMIN", description: "系統管理權限" },
  ];

  const createdPermissions = {};
  for (const permission of permissions) {
    createdPermissions[permission.name] = await prisma.permission.create({
      data: permission,
    });
  }

  // SUPERADMIN 角色獲得所有權限
  for (const permission of Object.values(createdPermissions)) {
    await prisma.rolePermission.create({
      data: {
        roleId: createdRoles["SUPERADMIN"].id,
        permissionId: permission.id,
      },
    });
  }

  // ADMIN 角色獲得所有權限
  for (const permission of Object.values(createdPermissions)) {
    await prisma.rolePermission.create({
      data: {
        roleId: createdRoles["ADMIN"].id,
        permissionId: permission.id,
      },
    });
  }

  // POWERUSER 角色獲得專案相關權限
  const powerUserPermissions = [
    "VIEW_PROJECTS",
    "CREATE_PROJECTS",
    "EDIT_PROJECTS",
    "VIEW_NODE_DEFINITIONS",
    "MANAGE_NODE_DEFINITIONS",
  ];
  for (const permName of powerUserPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: createdRoles["POWERUSER"].id,
        permissionId: createdPermissions[permName].id,
      },
    });
  }

  // READER 角色只獲得查看權限
  const readerPermissions = ["VIEW_PROJECTS", "VIEW_NODE_DEFINITIONS"];
  for (const permName of readerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: createdRoles["READER"].id,
        permissionId: createdPermissions[permName].id,
      },
    });
  }

  // 創建測試用戶
  const users = [
    {
      username: "蕭傳璋",
      email: "john_hsiao@example.com",
      password: await bcrypt.hash("888888", 10),
      role: "SUPERADMIN",
      avatar: "👨‍💼",
      isActive: true,
    },
    {
      username: "admin001",
      email: "admin001@example.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
      avatar: "👨‍💼",
      isActive: true,
    },
    {
      username: "admin002",
      email: "admin002@example.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
      avatar: "👩‍💼",
      isActive: true,
    },
    {
      username: "power001",
      email: "power001@example.com",
      password: await bcrypt.hash("Power@123", 10),
      role: "POWERUSER",
      avatar: "👨‍🔧",
      isActive: true,
    },
    {
      username: "power002",
      email: "power002@example.com",
      password: await bcrypt.hash("Power@123", 10),
      role: "POWERUSER",
      avatar: "👩‍🔧",
      isActive: true,
    },
    {
      username: "power003",
      email: "power003@example.com",
      password: await bcrypt.hash("Power@123", 10),
      role: "POWERUSER",
      avatar: "👨‍🔧",
      isActive: true,
    },
    {
      username: "reader001",
      email: "reader001@example.com",
      password: await bcrypt.hash("Reader@123", 10),
      role: "READER",
      avatar: "👨‍💻",
      isActive: true,
    },
    {
      username: "reader002",
      email: "reader002@example.com",
      password: await bcrypt.hash("Reader@123", 10),
      role: "READER",
      avatar: "👩‍💻",
      isActive: true,
    },
    {
      username: "reader003",
      email: "reader003@example.com",
      password: await bcrypt.hash("Reader@123", 10),
      role: "READER",
      avatar: "👨‍💻",
      isActive: true,
    },
    {
      username: "reader004",
      email: "reader004@example.com",
      password: await bcrypt.hash("Reader@123", 10),
      role: "READER",
      avatar: "👩‍💻",
      isActive: true,
    },
    {
      username: "reader005",
      email: "reader005@example.com",
      password: await bcrypt.hash("Reader@123", 10),
      role: "READER",
      avatar: "👨‍💻",
      isActive: true,
    },
  ];

  const createdUsers = {};
  for (const user of users) {
    const { role, ...userData } = user;
    const createdUser = await prisma.user.create({
      data: userData,
    });

    // 創建用戶角色關聯
    await prisma.userRole.create({
      data: {
        userId: createdUser.id,
        roleId: createdRoles[role].id,
      },
    });

    createdUsers[user.username] = createdUser;
  }

  // 創建系統代碼
  const systemCodes = [
    {
      systemCode: "IYM",
      systemName: "量測系統",
      systemDescription: "In-line Yield Management System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "QAS",
      systemName: "品質保證系統",
      systemDescription: "Quality Assurance System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "FIN",
      systemName: "財務系統",
      systemDescription: "Finance System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "HRM",
      systemName: "人資系統",
      systemDescription: "Human Resource Management",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "INV",
      systemName: "庫存系統",
      systemDescription: "Inventory System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "DOC",
      systemName: "文件管理系統",
      systemDescription: "Document Management System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "EQP",
      systemName: "設備管理系統",
      systemDescription: "Equipment Management System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      systemCode: "MFG",
      systemName: "製造系統",
      systemDescription: "Manufacturing System",
      isEnabled: true,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
  ];

  for (const code of systemCodes) {
    await prisma.systemCode.create({
      data: code,
    });
  }

  // 創建測試專案
  const projects = [
    {
      name: "2024年Q1客訴分析專案",
      description: "分析第一季度客戶反饋，找出主要問題點並提出改善建議",
      status: "active",
      systemCode: "IYM",
      projectNumber: `IYM_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      name: "產品品質改善追蹤",
      description: "追蹤並分析產品品質相關的客訴案件",
      status: "active",
      systemCode: "QAS",
      projectNumber: `QAS_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["power001"].id,
      updatedBy: createdUsers["power001"].id,
    },
    {
      name: "客服回應時效分析",
      description: "分析客服團隊對客訴的回應時效",
      status: "active",
      systemCode: "QAS",
      projectNumber: `QAS_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["power002"].id,
      updatedBy: createdUsers["admin002"].id,
    },
    {
      name: "包裝改善專案",
      description: "基於客訴回饋優化產品包裝",
      status: "draft",
      systemCode: "MFG",
      projectNumber: `MFG_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["power003"].id,
      updatedBy: createdUsers["power003"].id,
    },
    {
      name: "運送品質監控",
      description: "監控並分析運送過程中的產品損壞案例",
      status: "active",
      systemCode: "QAS",
      projectNumber: `QAS_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["admin002"].id,
      updatedBy: createdUsers["power001"].id,
    },
    {
      name: "新產品客訴追蹤",
      description: "追蹤新產品上市後的客戶反饋",
      status: "draft",
      systemCode: "QAS",
      projectNumber: `QAS_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["power001"].id,
      updatedBy: createdUsers["power001"].id,
    },
    {
      name: "客訴處理SOP優化",
      description: "根據客訴處理數據優化標準作業流程",
      status: "completed",
      systemCode: "DOC",
      projectNumber: `DOC_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      name: "跨部門協作效率分析",
      description: "分析客訴處理過程中的跨部門協作效率",
      status: "active",
      systemCode: "HRM",
      projectNumber: `HRM_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["power002"].id,
      updatedBy: createdUsers["power002"].id,
    },
    {
      name: "客戶滿意度改善計劃",
      description: "基於客訴分析制定客戶滿意度改善方案",
      status: "draft",
      systemCode: "QAS",
      projectNumber: `QAS_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["admin002"].id,
      updatedBy: createdUsers["power003"].id,
    },
    {
      name: "2023年度客訴報告",
      description: "彙整2023年度所有客訴數據並生成分析報告",
      status: "completed",
      systemCode: "DOC",
      projectNumber: `DOC_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: project,
    });
  }

  // 插入節點定義
  console.log("開始創建節點定義...");
  for (const nodeDef of nodeDefinitions) {
    await prisma.nodeDefinition.create({
      data: nodeDef,
    });
  }
  console.log("節點定義創建完成");

  // 在創建完用戶後，添加工作流程範本
  await createWorkflowTemplates(prisma, createdUsers);

  console.log("所有數據填充完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
