const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { errorResponse, successResponse } = require("../utils/jsonResponse");

// 獲取所有工作流程模板
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.flowTemplate.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    successResponse(res, 200, templates);
  } catch (error) {
    errorResponse(res, 500, "獲取工作流程模板失敗");
  }
};

// 根據 ID 獲取工作流程模板
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.flowTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!template) {
      return errorResponse(res, 404, "找不到工作流程模板");
    }

    successResponse(res, 200, template);
  } catch (error) {
    errorResponse(res, 500, "獲取工作流程模板失敗");
  }
};

// 創建新的工作流程模板
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      type,
      version,
      status = "draft",
      nodes = [],
      edges = [],
      metadata,
      createdBy,
      updatedBy,
    } = req.body;

    const template = await prisma.flowTemplate.create({
      data: {
        name,
        type,
        version,
        status,
        nodes,
        edges,
        metadata: metadata || null,
        createdBy,
        updatedBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    successResponse(res, 201, template);
  } catch (error) {
    errorResponse(res, 500, "創建工作流程模板失敗");
  }
};

// 更新工作流程模板
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, version, status, nodes, edges, metadata, updatedBy } =
      req.body;

    const template = await prisma.flowTemplate.update({
      where: { id },
      data: {
        name,
        type,
        version,
        status,
        ...(nodes && { nodes }),
        ...(edges && { edges }),
        ...(metadata && { metadata }),
        updatedBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    successResponse(res, 200, template);
  } catch (error) {
    errorResponse(res, 500, "更新工作流程模板失敗");
  }
};

// 刪除工作流程模板
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flowTemplate.delete({
      where: { id },
    });

    successResponse(res, 204, "刪除工作流程模板成功");
  } catch (error) {
    errorResponse(res, 500, "刪除工作流程模板失敗");
  }
};

// 複製工作流程模板
exports.cloneTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { createdBy, updatedBy } = req.body;

    // 獲取原始模板
    const sourceTemplate = await prisma.flowTemplate.findUnique({
      where: { id },
    });

    if (!sourceTemplate) {
      return errorResponse(res, 404, "找不到工作流程模板");
    }

    // 創建新的模板
    const newTemplate = await prisma.flowTemplate.create({
      data: {
        name: `${sourceTemplate.name} (複製)`,
        type: sourceTemplate.type,
        version: "1.0.0", // 重置版本號
        status: "draft", // 設置為草稿狀態
        nodes: sourceTemplate.nodes,
        edges: sourceTemplate.edges,
        metadata: sourceTemplate.metadata,
        createdBy,
        updatedBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    successResponse(res, 201, newTemplate);
  } catch (error) {
    errorResponse(res, 500, "複製工作流程模板失敗");
  }
};

// 更新模板狀態
exports.updateTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;

    const template = await prisma.flowTemplate.update({
      where: { id },
      data: {
        status,
        updatedBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    successResponse(res, 200, template);
  } catch (error) {
    errorResponse(res, 500, "更新工作流程模板狀態失敗");
  }
};

// 發布工作流程模板
exports.publishTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查模板是否存在
    const template = await prisma.flowTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return errorResponse(res, 404, "找不到工作流程模板");
    }

    // 更新模板狀態為發布
    await prisma.flowTemplate.update({
      where: { id },
      data: {
        status: "published",
      },
    });

    successResponse(res, 200, { message: "工作流程模板發布成功" });
  } catch (error) {
    errorResponse(res, 500, "發布工作流程模板失敗");
  }
};
