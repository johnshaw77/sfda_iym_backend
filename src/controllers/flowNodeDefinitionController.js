const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { errorResponse, successResponse } = require('../utils/jsonResponse');

// 獲取所有節點定義
exports.getAllNodeDefinitions = async (req, res) => {
  try {
    const nodeDefinitions = await prisma.flowNodeDefinition.findMany();
    successResponse(res, 200, nodeDefinitions);
  } catch (error) {
    errorResponse(res, 500, '獲取節點定義失敗');
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
      errorResponse(res, 404, '找不到節點定義');
    }
    
    successResponse(res, 200, nodeDefinition);
  } catch (error) {
    errorResponse(res, 500, '獲取節點定義失敗');
  }
};

// 創建新的節點定義
exports.createNodeDefinition = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.body.icon", req.body.icon);
  try {
    const {
      category,
      name,
      description,
      icon,
      componentName,
      componentPath,
      config,
      uiConfig,
      handles,
      
    } = req.body;

    const nodeDefinition = await prisma.flowNodeDefinition.create({
      data: {
        category,
        name,
        description,
        icon,
        componentName,
        componentPath,
        config: config || {},
        uiConfig: uiConfig || {},
        handles: handles || {}
      }
    });

    successResponse(res, 201, nodeDefinition);
  } catch (error) {
    errorResponse(res, 500, '創建節點定義失敗');
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
      icon,
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
        icon,
        componentName,
        componentPath,
        ...(config && { config }),
        ...(uiConfig && { uiConfig }),
        ...(handles && { handles })
      }
    });

    successResponse(res, 200, nodeDefinition);
  } catch (error) {
    errorResponse(res, 500, '更新節點定義失敗');
  }
};

// 刪除節點定義
exports.deleteNodeDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flowNodeDefinition.delete({
      where: { id }
    });
    
    successResponse(res, 204);
  } catch (error) {
    errorResponse(res, 500, '刪除節點定義失敗');
  }
};
