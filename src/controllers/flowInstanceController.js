const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { handlePrismaError } = require("../utils/errorHandler");
const { errorResponse, successResponse } = require("../utils/jsonResponse");
const NodeExecutorFactory = require("../services/nodeExecutors");
const { asyncHandler } = require("../utils/asyncHandler");

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
    // 檢查專案和模板是否存在
    const [project, template] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.flowTemplate.findUnique({ where: { id: templateId } }),
    ]);

    if (!project) {
      return errorResponse(res, 404, "專案不存在");
    }

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
        nodeStates: {},
        logs: [
          {
            type: "SYSTEM",
            message: "流程實例已創建",
            timestamp: new Date().toISOString(),
          },
        ],
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
        logs: {
          push: {
            type: "SYSTEM",
            message: "流程實例已更新",
            timestamp: new Date().toISOString(),
          },
        },
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
        startedAt: new Date(),
        updatedBy: userId,
        logs: {
          push: {
            type: "SYSTEM",
            message: "流程實例開始執行",
            timestamp: new Date().toISOString(),
          },
        },
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
 * 暫停流程實例
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const pauseInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    if (instance.status !== "running") {
      return errorResponse(res, 400, "只有運行中的流程實例可以暫停");
    }

    const updatedInstance = await prisma.flowInstance.update({
      where: { id },
      data: {
        status: "paused",
        pausedAt: new Date(),
        updatedBy: userId,
        logs: {
          push: {
            type: "SYSTEM",
            message: "流程實例已暫停",
            timestamp: new Date().toISOString(),
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
 * 繼續執行流程實例
 */
const resumeInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    if (instance.status !== "paused") {
      return errorResponse(res, 400, "只有暫停狀態的實例可以繼續執行");
    }

    const updatedInstance = await prisma.flowInstance.update({
      where: { id },
      data: {
        status: "running",
        pausedAt: null,
        updatedBy: userId,
        logs: {
          push: {
            type: "SYSTEM",
            message: "流程實例繼續執行",
            timestamp: new Date().toISOString(),
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
        status: "stopped",
        endedAt: new Date(),
        updatedBy: userId,
        logs: {
          push: {
            type: "SYSTEM",
            message: "流程實例已停止",
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    // TODO: 這裡需要實現實際的流程停止邏輯
    // 可能需要清理相關資源或發送通知

    successResponse(res, 200, updatedInstance);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 使用新的執行器工廠
const executeNodeLogic = async (node, input, context) => {
  return await NodeExecutorFactory.executeNode(node, input, context);
};

/**
 * 執行節點
 * @param {object} req - 請求對象
 * @param {object} res - 響應對象
 * @param {function} next - 下一個中間件
 * @returns {Promise<void>}
 */
exports.executeNode = asyncHandler(async (req, res, next) => {
  const { instanceId, nodeId } = req.params;
  const input = req.body;

  console.log(`執行節點 ${nodeId}，輸入數據:`, input);

  try {
    // 使用事務確保數據一致性
    const result = await prisma.$transaction(async (prisma) => {
      // 獲取流程實例
      const flowInstance = await prisma.flowInstance.findUnique({
        where: { id: instanceId },
        include: {
          flow: true,
        },
      });

      if (!flowInstance) {
        throw new Error(`找不到流程實例 ${instanceId}`);
      }

      // 獲取節點數據
      const nodeData = flowInstance.nodeData?.[nodeId] || {};
      console.log("節點數據:", nodeData);

      // 合併節點數據和輸入數據
      const mergedInput = {
        ...nodeData,
        ...input,
      };
      console.log("合併後的輸入數據:", mergedInput);

      // 獲取節點類型
      let nodeType = mergedInput.nodeType || nodeData.type;

      // 如果沒有節點類型，嘗試從節點數據中獲取
      if (!nodeType) {
        // 從流程定義中獲取節點
        const flowDefinition = flowInstance.flow.definition;
        const node = flowDefinition.nodes.find((n) => n.id === nodeId);

        if (node) {
          nodeType = node.type || node.data?.type;
          console.log(`從流程定義中獲取節點類型: ${nodeType}`);
        }
      }

      // 如果仍然沒有節點類型，嘗試從標籤或其他屬性推斷
      if (
        !nodeType &&
        (nodeData.label === "客訴單號選擇器" ||
          input.label === "客訴單號選擇器")
      ) {
        nodeType = "ComplaintSelectorNode";
        console.log(`從標籤推斷節點類型: ${nodeType}`);
      }

      if (!nodeType) {
        throw new Error(`無法確定節點 ${nodeId} 的類型`);
      }

      // 更新節點狀態為運行中
      const nodeStates = {
        ...flowInstance.nodeStates,
        [nodeId]: {
          ...flowInstance.nodeStates?.[nodeId],
          status: "running",
          startTime: new Date().toISOString(),
          retryCount: (flowInstance.nodeStates?.[nodeId]?.retryCount || 0) + 1,
        },
      };

      // 更新流程實例
      await prisma.flowInstance.update({
        where: { id: instanceId },
        data: {
          nodeStates,
          // 更新節點數據，確保保存客訴單號等信息
          nodeData: {
            ...flowInstance.nodeData,
            [nodeId]: {
              ...nodeData,
              ...input,
              type: nodeType, // 確保保存節點類型
            },
          },
        },
      });

      try {
        console.log(`開始執行節點 ${nodeId}，類型: ${nodeType}`);
        // 執行節點
        const startTime = Date.now();
        const result = await NodeExecutorFactory.executeNode(
          {
            id: nodeId,
            type: nodeType,
            data: mergedInput,
          },
          mergedInput,
          { flowInstance }
        );
        const endTime = Date.now();
        const executionTime = (endTime - startTime) / 1000; // 轉換為秒

        console.log(`節點 ${nodeId} 執行完成，結果:`, result);

        // 更新節點狀態為完成
        const updatedNodeStates = {
          ...nodeStates,
          [nodeId]: {
            ...nodeStates[nodeId],
            status: "completed",
            endTime: new Date().toISOString(),
            executionTime,
          },
        };

        // 更新節點上下文
        const nodeContext = {
          ...flowInstance.nodeContext,
          [nodeId]: {
            input: mergedInput,
            output: result,
            executionTime,
          },
        };

        // 更新流程實例
        const updatedFlowInstance = await prisma.flowInstance.update({
          where: { id: instanceId },
          data: {
            nodeStates: updatedNodeStates,
            nodeContext,
            // 更新節點數據，確保保存客訴單號等信息
            nodeData: {
              ...flowInstance.nodeData,
              [nodeId]: {
                ...nodeData,
                ...input,
                type: nodeType,
                complaintId: input.complaintId, // 確保保存客訴單號
              },
            },
          },
        });

        return updatedFlowInstance;
      } catch (error) {
        console.error(`執行節點 ${nodeId} 時發生錯誤:`, error);

        // 獲取詳細的錯誤信息
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name,
        };

        // 根據錯誤類型提供建議
        let suggestion = "請檢查輸入數據並重試";
        if (error.message.includes("不支持的節點類型")) {
          suggestion = "該節點類型不受支持，請聯繫系統管理員";
        } else if (error.message.includes("缺少必要的")) {
          suggestion = "請確保提供所有必要的輸入數據";
        } else if (error.code === "ECONNREFUSED") {
          suggestion = "無法連接到外部服務，請檢查網絡連接";
        }

        // 更新節點狀態為失敗，但不更改流程實例狀態
        const updatedNodeStates = {
          ...nodeStates,
          [nodeId]: {
            ...nodeStates[nodeId],
            status: "failed",
            error: error.message,
            endTime: new Date().toISOString(),
            errorDetails,
            suggestion,
          },
        };

        // 更新流程實例
        const updatedFlowInstance = await prisma.flowInstance.update({
          where: { id: instanceId },
          data: {
            nodeStates: updatedNodeStates,
            // 保持流程實例狀態不變
            // status: "running",
            // 更新節點數據，確保保存客訴單號等信息
            nodeData: {
              ...flowInstance.nodeData,
              [nodeId]: {
                ...nodeData,
                ...input,
                type: nodeType,
                complaintId: input.complaintId, // 確保保存客訴單號
              },
            },
          },
        });

        return updatedFlowInstance;
      }
    });

    // 返回成功響應
    return successResponse(res, {
      message: "節點執行成功",
      data: result,
    });
  } catch (error) {
    console.error("執行節點時發生錯誤:", error);
    return next(error);
  }
});

const getInstanceLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
      select: { logs: true },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    successResponse(res, 200, instance.logs);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

/**
 * 獲取節點日誌
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const getNodeLogs = async (req, res) => {
  try {
    const { id, nodeId } = req.params;

    const instance = await prisma.flowInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return errorResponse(res, 404, "流程實例不存在");
    }

    const nodeLogs = instance.logs.filter((log) => log.nodeId === nodeId);
    successResponse(res, 200, nodeLogs);
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
  executeNode,
  getInstanceLogs,
  getNodeLogs,
  pauseInstance,
  resumeInstance,
};
