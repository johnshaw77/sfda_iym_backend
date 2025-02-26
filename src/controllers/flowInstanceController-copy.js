const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { handlePrismaError } = require("../utils/errorHandler");
const { errorResponse, successResponse } = require("../utils/jsonResponse");
/**
 * 獲取所有流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const getAllInstances = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    const instances = await prisma.flowInstance.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
            projectNumber: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
        creator: {
          select: {
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    successResponse(res, 200, instances);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 根據ID獲取流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const getInstanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const instance = await prisma.flowInstance.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            name: true,
            projectNumber: true,
          },
        },
        template: {
          select: {
            name: true,
            nodes: true,
            edges: true,
          },
        },
        creator: {
          select: {
            username: true,
            avatar: true,
          },
        },
        updater: {
          select: {
            username: true,
          },
        },
        documents: true,
      },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    successResponse(res, 200, instance);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 創建流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const createInstance = async (req, res) => {
  try {
    const { projectId, templateId, context } = req.body;
    const userId = req.user.id;

    // 檢查專案是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse(res, 404, "專案不存在");
    }

    // 檢查模板是否存在
    const template = await prisma.flowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse(res, 404, "流程模板不存在");
    }

    // 創建流程實例
    const instance = await prisma.flowInstance.create({
      data: {
        projectId,
        templateId,
        context: context || {},
        nodes: template.nodes,
        edges: template.edges,
        status: "draft",
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        project: {
          select: {
            name: true,
            projectNumber: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
        creator: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    successResponse(res, 201, instance);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 更新流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const updateInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const { context, nodes, edges } = req.body;
    const userId = req.user.id;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    // 只有草稿狀態可以更新
    if (instance.status !== "draft") {
      return errorResponse(res, 400, "只有草稿狀態的流程實例可以更新");
    }

    const updatedInstance = await prisma.flowInstance.update({
      where: { id },
      data: {
        context: context || instance.context,
        nodes: nodes || instance.nodes,
        edges: edges || instance.edges,
        updatedBy: userId,
      },
      include: {
        project: {
          select: {
            name: true,
            projectNumber: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
        updater: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    successResponse(res, 200, updatedInstance);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 刪除流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const deleteInstance = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    // 只有草稿和失敗狀態可以刪除
    if (!["draft", "failed"].includes(instance.status)) {
      return errorResponse(res, 400, "只有草稿和失敗狀態的流程實例可以刪除");
    }

    await prisma.flowInstance.delete({
      where: { id },
    });

    successResponse(res, 200, { message: "流程實例已刪除" });
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 啟動流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const startInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    // 只有草稿狀態可以啟動
    if (instance.status !== "draft") {
      return errorResponse(res, 400, "只有草稿狀態的流程實例可以啟動");
    }

    const updatedInstance = await prisma.flowInstance.update({
      where: { id },
      data: {
        status: "running",
        updatedBy: userId,
      },
    });

    // TODO: 這裡需要實現實際的流程執行邏輯
    // 可以使用消息隊列或其他異步處理方式

    successResponse(res, 200, updatedInstance);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 停止流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const stopInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    // 只有運行中狀態可以停止
    if (instance.status !== "running") {
      return errorResponse(res, 400, "只有運行中的流程實例可以停止");
    }

    const updatedInstance = await prisma.flowInstance.update({
      where: { id },
      data: {
        status: "failed",
        updatedBy: userId,
      },
    });

    // TODO: 這裡需要實現實際的流程停止邏輯
    // 可能需要清理相關資源或發送通知

    successResponse(res, 200, updatedInstance);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

module.exports = {
  getAllInstances,
  getInstanceById,
  createInstance,
  updateInstance,
  deleteInstance,
  startInstance,
  stopInstance,
};
