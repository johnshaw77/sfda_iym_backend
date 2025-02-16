const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // 清理現有數據（注意順序以避免外鍵約束問題）
  await prisma.project.deleteMany();
  await prisma.systemCode.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.nodeType.deleteMany();

  // 創建基本角色
  const roles = [
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
  ];

  const createdPermissions = {};
  for (const permission of permissions) {
    createdPermissions[permission.name] = await prisma.permission.create({
      data: permission,
    });
  }

  // 為角色分配權限
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
  const readerPermissions = ["VIEW_PROJECTS"];
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
      role: "ADMIN",
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

  // 建立基礎節點類型
  const nodeTypes = [
    {
      typeKey: "complaint_selector",
      category: "input",
      nodeName: "客訴選擇器",
      description: "用於選擇要分析的客訴案件",
      componentName: "ComplaintSelector",
      defaultConfig: JSON.stringify({
        multiple: false,
        dateRange: true,
        filters: {
          status: ["open", "closed"],
          priority: ["high", "medium", "low"],
        },
      }),
      apiEndpoint: "/api/complaints",
      apiMethod: "GET",
      inputSchema: JSON.stringify({
        type: "object",
        properties: {
          dateRange: {
            type: "object",
            properties: {
              startDate: { type: "string", format: "date" },
              endDate: { type: "string", format: "date" },
            },
          },
          filters: {
            type: "object",
            properties: {
              status: { type: "array", items: { type: "string" } },
              priority: { type: "array", items: { type: "string" } },
            },
          },
        },
      }),
      outputSchema: JSON.stringify({
        type: "object",
        properties: {
          selectedComplaints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                status: { type: "string" },
                priority: { type: "string" },
              },
            },
          },
        },
      }),
      uiSchema: JSON.stringify({
        dateRange: {
          "ui:widget": "dateRange",
          "ui:title": "日期範圍",
        },
        filters: {
          "ui:title": "篩選條件",
          status: {
            "ui:widget": "checkboxes",
            "ui:title": "狀態",
          },
          priority: {
            "ui:widget": "checkboxes",
            "ui:title": "優先級",
          },
        },
      }),
      icon: "📋",
    },
    {
      typeKey: "data_analyzer",
      category: "process",
      nodeName: "數據分析器",
      description: "分析客訴數據，生成統計報告",
      componentName: "DataAnalyzer",
      defaultConfig: JSON.stringify({
        analysisTypes: ["trend", "category", "priority"],
        visualization: true,
      }),
      apiEndpoint: "/api/analyze",
      apiMethod: "POST",
      inputSchema: JSON.stringify({
        type: "object",
        properties: {
          complaints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                data: { type: "object" },
              },
            },
          },
          analysisTypes: {
            type: "array",
            items: { type: "string", enum: ["trend", "category", "priority"] },
          },
        },
      }),
      outputSchema: JSON.stringify({
        type: "object",
        properties: {
          trends: { type: "object" },
          categories: { type: "object" },
          priorities: { type: "object" },
        },
      }),
      uiSchema: JSON.stringify({
        analysisTypes: {
          "ui:widget": "checkboxes",
          "ui:title": "分析類型",
        },
      }),
      icon: "📊",
    },
    {
      typeKey: "report_generator",
      category: "output",
      nodeName: "報表生成器",
      description: "根據分析結果生成報表",
      componentName: "ReportGenerator",
      defaultConfig: JSON.stringify({
        template: "default",
        format: "pdf",
        sections: ["summary", "analysis", "recommendations"],
      }),
      apiEndpoint: "/api/reports",
      apiMethod: "POST",
      inputSchema: JSON.stringify({
        type: "object",
        properties: {
          analysisResults: { type: "object" },
          template: { type: "string" },
          format: { type: "string", enum: ["pdf", "excel"] },
        },
      }),
      outputSchema: JSON.stringify({
        type: "object",
        properties: {
          reportUrl: { type: "string" },
          reportId: { type: "string" },
        },
      }),
      uiSchema: JSON.stringify({
        template: {
          "ui:widget": "select",
          "ui:title": "報表模板",
        },
        format: {
          "ui:widget": "radio",
          "ui:title": "輸出格式",
        },
      }),
      icon: "📑",
    },
  ];

  // 插入節點類型
  for (const nodeType of nodeTypes) {
    await prisma.nodeType.create({
      data: nodeType,
    });
  }

  // 創建工作流程範本
  const workflowTemplates = [
    {
      templateName: "客訴分析標準流程",
      templateCategory: "客訴分析",
      description:
        "用於分析客戶投訴的標準工作流程，包含數據收集、分析和報告生成",
      version: "1.0.0",
      status: "published",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin001"].id,
    },
    {
      templateName: "良率分析基礎流程",
      templateCategory: "良率分析",
      description: "基礎的良率分析流程，適用於一般產品的良率評估",
      version: "1.0.0",
      status: "published",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin002"].id,
    },
    {
      templateName: "品質異常追蹤流程",
      templateCategory: "品質管理",
      description: "用於追蹤和分析產品品質異常的工作流程",
      version: "1.0.0",
      status: "draft",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin001"].id,
    },
    {
      templateName: "製程參數優化流程",
      templateCategory: "製程優化",
      description: "針對製程參數進行優化分析的工作流程",
      version: "1.1.0",
      status: "published",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin002"].id,
    },
    {
      templateName: "設備效能分析流程",
      templateCategory: "設備管理",
      description: "分析設備運行效能和維護需求的工作流程",
      version: "1.0.0",
      status: "published",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin001"].id,
    },
    {
      templateName: "原物料品質分析",
      templateCategory: "品質管理",
      description: "針對原物料進行品質分析的標準流程",
      version: "1.0.0",
      status: "draft",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin002"].id,
    },
    {
      templateName: "產品壽命預測流程",
      templateCategory: "產品分析",
      description: "使用歷史數據預測產品壽命的分析流程",
      version: "1.0.0",
      status: "published",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin001"].id,
    },
    {
      templateName: "包裝缺陷分析流程",
      templateCategory: "品質管理",
      description: "分析產品包裝缺陷的標準工作流程",
      version: "1.0.0",
      status: "deprecated",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin002"].id,
    },
    {
      templateName: "供應商評估流程",
      templateCategory: "供應鏈管理",
      description: "評估供應商品質表現的分析流程",
      version: "1.0.0",
      status: "published",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin001"].id,
    },
    {
      templateName: "新產品導入分析",
      templateCategory: "產品分析",
      description: "新產品導入階段的品質分析流程",
      version: "1.0.0",
      status: "draft",
      config: JSON.stringify({
        canvasSize: { width: 1920, height: 1080 },
        gridSize: 20,
        snapToGrid: true,
      }),
      createdBy: createdUsers["admin002"].id,
    },
  ];

  // 插入工作流程範本
  for (const template of workflowTemplates) {
    await prisma.workflowTemplate.create({
      data: template,
    });
  }

  console.log("已成功初始化測試數據");
}

main()
  .catch((e) => {
    console.error("錯誤：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
