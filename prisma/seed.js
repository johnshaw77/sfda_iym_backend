const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // 首先確保有一個測試用戶
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      username: "testuser",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9kW", // "password123"
      role: "ADMIN",
    },
  });

  // 創建5個工作流程
  const workflows = [
    {
      name: "年度財報審核流程",
      description: "處理公司年度財務報告的審核和核准流程",
      status: "in_progress",
      createdBy: testUser.id,
      updatedBy: testUser.id,
    },
    {
      name: "新產品開發提案",
      description: "新產品概念提案到原型開發的完整流程",
      status: "draft",
      createdBy: testUser.id,
      updatedBy: testUser.id,
    },
    {
      name: "員工入職流程",
      description: "新進員工的入職文件處理和培訓安排",
      status: "completed",
      createdBy: testUser.id,
      updatedBy: testUser.id,
    },
    {
      name: "市場調研專案",
      description: "競品分析和市場機會評估報告",
      status: "in_progress",
      createdBy: testUser.id,
      updatedBy: testUser.id,
    },
    {
      name: "系統升級計劃",
      description: "核心系統升級和數據遷移方案",
      status: "draft",
      createdBy: testUser.id,
      updatedBy: testUser.id,
    },
  ];

  for (const workflow of workflows) {
    await prisma.workflow.create({
      data: workflow,
    });
  }

  console.log("已成功創建測試數據！");
}

main()
  .catch((e) => {
    console.error("錯誤：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
