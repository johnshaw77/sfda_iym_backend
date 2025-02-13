const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * 創建工作流程範本
 */
const createTemplate = async (req, res, next) => {
  try {
    const { templateName, templateCategory, description, version, config } =
      req.body;

    // 驗證必要欄位
    if (!templateName || !templateCategory || !version) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "請提供範本名稱、分類和版本號",
      });
    }

    // 創建範本
    const template = await prisma.workflowTemplate.create({
      data: {
        templateName,
        templateCategory,
        description,
        version,
        config: config ? JSON.stringify(config) : null,
        status: "draft",
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      code: 201,
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取工作流程範本列表
 */
const getTemplates = async (req, res, next) => {
  try {
    const { category, status } = req.query;

    // 構建查詢條件
    const where = {};
    if (category) {
      where.templateCategory = category;
    }
    if (status) {
      where.status = status;
    }

    // 獲取範本列表
    const templates = await prisma.workflowTemplate.findMany({
      where,
      include: {
        creator: {
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

    res.json({
      code: 200,
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取工作流程範本詳情
 */
const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await prisma.workflowTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        nodeTemplates: {
          include: {
            nodeType: true,
            sourceConnections: true,
            targetConnections: true,
          },
        },
        templateConnections: true,
      },
    });

    if (!template) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "找不到該範本",
      });
    }

    res.json({
      code: 200,
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新工作流程範本
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { templateName, templateCategory, description, version, config } =
      req.body;

    // 檢查範本是否存在
    const existingTemplate = await prisma.workflowTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "找不到該範本",
      });
    }

    // 檢查範本狀態
    if (existingTemplate.status === "published") {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "已發布的範本不能修改",
      });
    }

    // 更新範本
    const template = await prisma.workflowTemplate.update({
      where: { id },
      data: {
        templateName,
        templateCategory,
        description,
        version,
        config: config ? JSON.stringify(config) : existingTemplate.config,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      code: 200,
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除工作流程範本
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 檢查範本是否存在
    const existingTemplate = await prisma.workflowTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "找不到該範本",
      });
    }

    // 檢查範本狀態
    if (existingTemplate.status === "published") {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "已發布的範本不能刪除",
      });
    }

    // 刪除範本
    await prisma.workflowTemplate.delete({
      where: { id },
    });

    res.json({
      code: 200,
      success: true,
      message: "範本刪除成功",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 發布工作流程範本
 */
const publishTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 檢查範本是否存在
    const existingTemplate = await prisma.workflowTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "找不到該範本",
      });
    }

    // 檢查範本狀態
    if (existingTemplate.status !== "draft") {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "只有草稿狀態的範本可以發布",
      });
    }

    // 更新範本狀態
    const template = await prisma.workflowTemplate.update({
      where: { id },
      data: {
        status: "published",
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      code: 200,
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 棄用工作流程範本
 */
const deprecateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 檢查範本是否存在
    const existingTemplate = await prisma.workflowTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        code: 404,
        success: false,
        error: "找不到該範本",
      });
    }

    // 檢查範本狀態
    if (existingTemplate.status !== "published") {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "只有已發布的範本可以棄用",
      });
    }

    // 更新範本狀態
    const template = await prisma.workflowTemplate.update({
      where: { id },
      data: {
        status: "deprecated",
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      code: 200,
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  publishTemplate,
  deprecateTemplate,
};
