const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 獲取所有工作流程模板
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.flowTemplate.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        updater: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: '獲取工作流程模板失敗' });
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
            username: true
          }
        },
        updater: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    if (!template) {
      return res.status(404).json({ error: '找不到工作流程模板' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: '獲取工作流程模板失敗' });
  }
};

// 創建新的工作流程模板
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      type,
      version,
      status = 'draft',
      nodes = [],
      edges = [],
      metadata,
      createdBy,
      updatedBy
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
        updatedBy
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        updater: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('創建工作流程模板失敗:', error);
    res.status(500).json({ error: '創建工作流程模板失敗' });
  }
};

// 更新工作流程模板
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      version,
      status,
      nodes,
      edges,
      metadata,
      updatedBy
    } = req.body;

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
        updatedBy
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        updater: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: '更新工作流程模板失敗' });
  }
};

// 刪除工作流程模板
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flowTemplate.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '刪除工作流程模板失敗' });
  }
};

// 複製工作流程模板
exports.cloneTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { createdBy, updatedBy } = req.body;

    // 獲取原始模板
    const sourceTemplate = await prisma.flowTemplate.findUnique({
      where: { id }
    });

    if (!sourceTemplate) {
      return res.status(404).json({ error: '找不到工作流程模板' });
    }

    // 創建新的模板
    const newTemplate = await prisma.flowTemplate.create({
      data: {
        name: `${sourceTemplate.name} (複製)`,
        type: sourceTemplate.type,
        version: '1.0.0', // 重置版本號
        status: 'draft', // 設置為草稿狀態
        nodes: sourceTemplate.nodes,
        edges: sourceTemplate.edges,
        metadata: sourceTemplate.metadata,
        createdBy,
        updatedBy
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        updater: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: '複製工作流程模板失敗' });
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
        updatedBy
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        updater: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: '更新工作流程模板狀態失敗' });
  }
};
