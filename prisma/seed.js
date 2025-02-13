const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // 清理現有數據
  await prisma.nodeType.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.userRole.deleteMany();

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

  // 創建測試專案
  const projects = [
    {
      name: "2024年Q1客訴分析專案",
      description: "分析第一季度客戶反饋，找出主要問題點並提出改善建議",
      status: "active",
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      name: "產品品質改善追蹤",
      description: "追蹤並分析產品品質相關的客訴案件",
      status: "active",
      createdBy: createdUsers["power001"].id,
      updatedBy: createdUsers["power001"].id,
    },
    {
      name: "客服回應時效分析",
      description: "分析客服團隊對客訴的回應時效",
      status: "active",
      createdBy: createdUsers["power002"].id,
      updatedBy: createdUsers["admin002"].id,
    },
    {
      name: "包裝改善專案",
      description: "基於客訴回饋優化產品包裝",
      status: "draft",
      createdBy: createdUsers["power003"].id,
      updatedBy: createdUsers["power003"].id,
    },
    {
      name: "運送品質監控",
      description: "監控並分析運送過程中的產品損壞案例",
      status: "active",
      createdBy: createdUsers["admin002"].id,
      updatedBy: createdUsers["power001"].id,
    },
    {
      name: "新產品客訴追蹤",
      description: "追蹤新產品上市後的客戶反饋",
      status: "draft",
      createdBy: createdUsers["power001"].id,
      updatedBy: createdUsers["power001"].id,
    },
    {
      name: "客訴處理SOP優化",
      description: "根據客訴處理數據優化標準作業流程",
      status: "completed",
      createdBy: createdUsers["admin001"].id,
      updatedBy: createdUsers["admin001"].id,
    },
    {
      name: "跨部門協作效率分析",
      description: "分析客訴處理過程中的跨部門協作效率",
      status: "active",
      createdBy: createdUsers["power002"].id,
      updatedBy: createdUsers["power002"].id,
    },
    {
      name: "客戶滿意度改善計劃",
      description: "基於客訴分析制定客戶滿意度改善方案",
      status: "draft",
      createdBy: createdUsers["admin002"].id,
      updatedBy: createdUsers["power003"].id,
    },
    {
      name: "2023年度客訴報告",
      description: "彙整2023年度所有客訴數據並生成分析報告",
      status: "completed",
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
