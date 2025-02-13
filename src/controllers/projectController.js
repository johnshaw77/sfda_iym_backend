const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 創建新專案
exports.createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "draft",
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
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
    const projects = await prisma.project.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
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
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
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

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: "專案刪除成功" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "專案不存在" });
    }
    console.error("刪除專案錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};
