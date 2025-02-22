const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 獲取所有節點定義
exports.getAllNodeDefinitions = async (req, res) => {
  try {
    const nodeDefinitions = await prisma.flowNodeDefinition.findMany();
    res.json(nodeDefinitions);
  } catch (error) {
    res.status(500).json({ error: '獲取節點定義失敗' });
  }
};

// 根據 ID 獲取節點定義
exports.getNodeDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const nodeDefinition = await prisma.flowNodeDefinition.findUnique({
      where: { id }
    });
    
    if (!nodeDefinition) {
      return res.status(404).json({ error: '找不到節點定義' });
    }
    
    res.json(nodeDefinition);
  } catch (error) {
    res.status(500).json({ error: '獲取節點定義失敗' });
  }
};

// 創建新的節點定義
exports.createNodeDefinition = async (req, res) => {
  try {
    const {
      definitionKey,
      category,
      name,
      description,
      componentName,
      componentPath,
      config,
      uiConfig,
      handles
    } = req.body;

    const nodeDefinition = await prisma.flowNodeDefinition.create({
      data: {
        definitionKey,
        category,
        name,
        description,
        componentName,
        componentPath,
        config: config || {},
        uiConfig: uiConfig || {},
        handles: handles || {}
      }
    });

    res.status(201).json(nodeDefinition);
  } catch (error) {
    res.status(500).json({ error: '創建節點定義失敗' });
  }
};

// 更新節點定義
exports.updateNodeDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      name,
      description,
      componentName,
      componentPath,
      config,
      uiConfig,
      handles
    } = req.body;

    const nodeDefinition = await prisma.flowNodeDefinition.update({
      where: { id },
      data: {
        category,
        name,
        description,
        componentName,
        componentPath,
        ...(config && { config }),
        ...(uiConfig && { uiConfig }),
        ...(handles && { handles })
      }
    });

    res.json(nodeDefinition);
  } catch (error) {
    res.status(500).json({ error: '更新節點定義失敗' });
  }
};

// 刪除節點定義
exports.deleteNodeDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flowNodeDefinition.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '刪除節點定義失敗' });
  }
};
