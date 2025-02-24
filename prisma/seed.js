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

async function createFlowNodeDefinitions(prisma) {
  console.log("開始創建流程節點定義...");

  const nodeTypes = ['input', 'process', 'output'];
  const nodeCategories = {
    input: 'data-input',
    process: 'data-process',
    output: 'data-output'
  };
  const nodeComponents = {
    input: 'InputNode',
    process: 'ProcessNode',
    output: 'OutputNode'
  };
  const nodeNames = [
    '資料輸入節點',
    '表單填寫節點',
    '資料驗證節點',
    '資料處理節點',
    '資料轉換節點',
    '條件判斷節點',
    '資料合併節點',
    '資料分流節點',
    '資料過濾節點',
    '資料統計節點',
    '資料匯出節點',
    '郵件發送節點',
    '通知提醒節點',
    'API調用節點',
    '資料庫操作節點',
    '檔案上傳節點',
    '檔案下載節點',
    '報表生成節點',
    '資料歸檔節點',
    '審批節點'
  ];

  const nodeDescriptions = [
    '用於輸入基礎數據的節點',
    '提供表單界面供用戶填寫數據',
    '驗證輸入數據的格式和有效性',
    '對數據進行基礎處理和轉換',
    '將數據格式轉換為指定格式',
    '根據條件判斷流程走向',
    '將多個數據源的數據合併',
    '將數據分發到不同的處理流程',
    '根據條件過濾數據',
    '對數據進行統計分析',
    '將數據導出為特定格式',
    '發送郵件通知',
    '發送系統通知或提醒',
    '調用外部API服務',
    '執行數據庫操作',
    '處理文件上傳功能',
    '處理文件下載功能',
    '生成各類統計報表',
    '將數據歸檔保存',
    '處理審批流程'
  ];

  for (let i = 0; i < 20; i++) {
    const nodeType = nodeTypes[Math.floor(i / 7)]; // 平均分配節點類型
    await prisma.flowNodeDefinition.create({
      data: {
        name: nodeNames[i],
        category: nodeCategories[nodeType],
        componentName: nodeComponents[nodeType],
        description: nodeDescriptions[i],
        config: {
          icon: `${nodeType}-icon`,
          color: nodeType === 'input' ? '#1890ff' : nodeType === 'process' ? '#52c41a' : '#722ed1',
          handles: {
            input: nodeType !== 'input',
            output: nodeType !== 'output'
          }
        }
      }
    });
    console.log(`已創建流程節點定義: ${nodeNames[i]}`);
  }
}

async function createFlowTemplates(prisma) {
  console.log("開始創建流程模板...");

  // 獲取系統管理員用戶
  const admin = await prisma.user.findFirst({
    where: {
      username: 'admin'
    }
  });

  if (!admin) {
    throw new Error('找不到系統管理員用戶');
  }

  const templateNames = [
    '客戶投訴處理流程',
    '產品質檢流程',
    '採購申請流程',
    '請假審批流程',
    '費用報銷流程',
    '產品入庫流程',
    '設備維修流程',
    '文件審核流程',
    '員工入職流程',
    '項目立項流程',
    '合同審批流程',
    '產品出庫流程',
    '培訓申請流程',
    '銷售訂單流程',
    '供應商評估流程',
    '品質改善流程',
    '預算審批流程',
    '加班申請流程',
    '市場調研流程',
    '產品研發流程'
  ];

  const templateDescriptions = [
    '處理客戶投訴的標準流程',
    '產品質量檢測的標準流程',
    '物料採購申請和審批流程',
    '員工請假申請和審批流程',
    '費用報銷申請和審批流程',
    '產品入庫檢查和記錄流程',
    '設備故障報修和維修流程',
    '文件審核和批准流程',
    '新員工入職手續辦理流程',
    '新項目立項申請和審批流程',
    '合同審核和簽署流程',
    '產品出庫檢查和發貨流程',
    '員工培訓申請和安排流程',
    '銷售訂單處理和確認流程',
    '供應商資質評估流程',
    '品質問題改善和追蹤流程',
    '部門預算審批流程',
    '員工加班申請和審批流程',
    '市場調研實施和報告流程',
    '新產品研發和測試流程'
  ];

  for (let i = 0; i < 20; i++) {
    // 創建模板
    const template = await prisma.flowTemplate.create({
      data: {
        name: templateNames[i],
        description: templateDescriptions[i],
        type: "business",
        version: "1.0.0",
        status: i % 2 === 0 ? "active" : "draft",
        createdBy: admin.id,
        updatedBy: admin.id,
        nodes: [
            {
              id: `node-${i}-1`,
              position: { x: 100, y: 100 },
              data: {
                label: '開始節點',
                nodeRef: ''
              }
            },
            {
              id: `node-${i}-2`,
              position: { x: 300, y: 100 },
              data: {
                label: '處理節點',
                nodeRef: ''
              }
            },
            {
              id: `node-${i}-3`,
              position: { x: 500, y: 100 },
              data: {
                label: '結束節點',
                nodeRef: ''
              }
            }
          ],
        edges: [
            {
              id: `edge-${i}-1`,
              source: `node-${i}-1`,
              target: `node-${i}-2`
            },
            {
              id: `edge-${i}-2`,
              source: `node-${i}-2`,
              target: `node-${i}-3`
            }
          ]
      }
    });
    console.log(`已創建流程模板: ${templateNames[i]}`);
  }
}

async function cleanupData(prisma) {
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
}

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("開始清理現有數據...");
    await cleanupData(prisma);
    console.log("數據清理完成");

    console.log("開始創建基本角色...");
    // 創建系統管理員用戶
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        avatar: '👨‍💼',
        isActive: true
      }
    });
    console.log("系統管理員用戶創建完成");

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

    await createFlowNodeDefinitions(prisma);
    await createFlowTemplates(prisma);
  } catch (error) {
    console.error("Seed 失敗:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
