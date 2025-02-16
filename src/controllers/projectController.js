const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 生成專案編號
const generateProjectNumber = (systemCode) => {
  const date = new Date();
  const dateStr = date.toISOString().replace(/[-:]/g, "").slice(0, 8);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${systemCode}_${dateStr}_${randomStr}`;
};

// 創建新專案
exports.createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const userId = req.user.id;
    const defaultSystemCode = process.env.DEFAULT_SYSTEM_CODE || "IYM";

    // 驗證狀態值
    const validStatuses = ["draft", "active", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "無效的狀態值",
        validStatuses,
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "draft",
        systemCode: defaultSystemCode,
        projectNumber: generateProjectNumber(defaultSystemCode),
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "專案創建成功",
      project,
    });
  } catch (error) {
    console.error("創建專案錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 獲取所有專案
exports.getAllProjects = async (req, res) => {
  try {
    const { includeWorkflows } = req.query;
    const include = {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
      updater: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    };

    // 如果需要包含工作流程實例資訊
    if (includeWorkflows === "true") {
      include.workflowInstances = {
        include: {
          workflowTemplate: {
            select: {
              id: true,
              templateName: true,
              templateCategory: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          nodeInstances: {
            select: {
              id: true,
              status: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      include,
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("獲取專案列表錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 獲取單個專案
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeWorkflows } = req.query;

    const include = {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
      updater: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    };

    // 如果需要包含工作流程實例資訊
    if (includeWorkflows === "true") {
      include.workflowInstances = {
        include: {
          workflowTemplate: {
            select: {
              id: true,
              templateName: true,
              templateCategory: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          nodeInstances: {
            select: {
              id: true,
              status: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      };
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include,
    });

    if (!project) {
      return res.status(404).json({ message: "專案不存在" });
    }

    res.json(project);
  } catch (error) {
    console.error("獲取專案詳情錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 更新專案
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user.id;

    // 驗證狀態值
    const validStatuses = ["draft", "active", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "無效的狀態值",
        validStatuses,
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        updatedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      message: "專案更新成功",
      project,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "專案不存在" });
    }
    console.error("更新專案錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 刪除專案
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查是否存在相關的工作流程實例
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workflowInstances: {
          select: { id: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "專案不存在" });
    }

    if (project.workflowInstances.length > 0) {
      return res.status(400).json({
        message: "無法刪除專案，請先刪除相關的工作流程實例",
        workflowInstanceCount: project.workflowInstances.length,
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: "專案刪除成功" });
  } catch (error) {
    console.error("刪除專案錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};
