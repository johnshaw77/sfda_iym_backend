const prisma = require("../utils/prisma");

// 統一的錯誤回應格式
const errorResponse = (res, status, message, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(status).json(response);
};

// 統一的成功回應格式
const successResponse = (res, status, data) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

// 驗證函數
const validateNodeDefinition = (data) => {
  const errors = [];

  // 驗證 typeKey
  if (!data.typeKey) {
    errors.push("typeKey 為必填欄位");
  } else {
    if (data.typeKey.length < 5 || data.typeKey.length > 15) {
      errors.push("typeKey 長度必須在 5 到 15 個字元之間");
    }
    if (!/^[a-z0-9-]+$/.test(data.typeKey)) {
      errors.push("typeKey 只能包含小寫英文字母、數字和連字符號");
    }
  }

  // 驗證必填欄位
  if (!data.name) {
    errors.push("name 為必填欄位");
  }
  if (!data.category) {
    errors.push("category 為必填欄位");
  }

  // 驗證 API 相關欄位
  if (data.apiEndpoint && !data.apiMethod) {
    errors.push("當提供 apiEndpoint 時，apiMethod 為必填");
  }
  if (
    data.apiMethod &&
    !["GET", "POST", "PUT", "DELETE"].includes(data.apiMethod)
  ) {
    errors.push("apiMethod 必須是 GET、POST、PUT 或 DELETE");
  }

  return errors;
};

// 獲取所有節點定義
exports.getNodeDefinitions = async (req, res) => {
  try {
    const nodeDefinitions = await prisma.nodeDefinition.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return successResponse(res, 200, nodeDefinitions);
  } catch (error) {
    console.error("獲取節點定義失敗:", error);
    return errorResponse(res, 500, "獲取節點定義失敗", {
      detail: error.message,
    });
  }
};

// 獲取單個節點定義
exports.getNodeDefinition = async (req, res) => {
  try {
    const { typeKey } = req.params;
    const nodeDefinition = await prisma.nodeDefinition.findUnique({
      where: { typeKey },
    });

    if (!nodeDefinition) {
      return errorResponse(res, 404, "節點定義不存在", {
        typeKey,
      });
    }

    return successResponse(res, 200, nodeDefinition);
  } catch (error) {
    console.error("獲取節點定義失敗:", error);
    return errorResponse(res, 500, "獲取節點定義失敗", {
      detail: error.message,
      typeKey: req.params.typeKey,
    });
  }
};

// 創建節點定義
exports.createNodeDefinition = async (req, res) => {
  try {
    const {
      typeKey,
      name,
      category,
      description,
      version,
      componentName,
      apiEndpoint,
      apiMethod,
      uiConfig,
      validationRules,
      handles,
    } = req.body;

    // 驗證欄位
    const validationErrors = validateNodeDefinition(req.body);
    if (validationErrors.length > 0) {
      return errorResponse(res, 400, "驗證失敗", validationErrors);
    }

    // 檢查 typeKey 是否已存在
    const existing = await prisma.nodeDefinition.findUnique({
      where: { typeKey },
    });

    if (existing) {
      return errorResponse(res, 400, "節點定義鍵值已存在", {
        typeKey,
      });
    }

    const nodeDefinition = await prisma.nodeDefinition.create({
      data: {
        typeKey,
        name,
        category,
        description,
        version: version || "1.0.0",
        componentName,
        apiEndpoint,
        apiMethod,
        uiConfig: uiConfig || {},
        validationRules: validationRules || { required: false },
        handles: handles || { inputs: [], outputs: [] },
      },
    });

    return successResponse(res, 201, nodeDefinition);
  } catch (error) {
    console.error("創建節點定義失敗:", error);
    return errorResponse(res, 500, "創建節點定義失敗", {
      detail: error.message,
      data: req.body,
    });
  }
};

// 更新節點定義
exports.updateNodeDefinition = async (req, res) => {
  try {
    const { typeKey } = req.params;
    const {
      name,
      category,
      description,
      version,
      componentName,
      apiEndpoint,
      apiMethod,
      uiConfig,
      validationRules,
      handles,
    } = req.body;

    // 驗證欄位
    const validationErrors = validateNodeDefinition({ typeKey, ...req.body });
    if (validationErrors.length > 0) {
      return errorResponse(res, 400, "驗證失敗", validationErrors);
    }

    const nodeDefinition = await prisma.nodeDefinition.update({
      where: { typeKey },
      data: {
        name,
        category,
        description,
        version,
        componentName,
        apiEndpoint,
        apiMethod,
        uiConfig: uiConfig || {},
        validationRules: validationRules || { required: false },
        handles: handles || { inputs: [], outputs: [] },
      },
    });

    return successResponse(res, 200, nodeDefinition);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "節點定義不存在", {
        typeKey: req.params.typeKey,
      });
    }
    console.error("更新節點定義失敗:", error);
    return errorResponse(res, 500, "更新節點定義失敗", {
      detail: error.message,
      typeKey: req.params.typeKey,
      data: req.body,
    });
  }
};

// 刪除節點定義
exports.deleteNodeDefinition = async (req, res) => {
  try {
    const { typeKey } = req.params;

    const result = await prisma.nodeDefinition.delete({
      where: { typeKey },
    });

    return successResponse(res, 200, { typeKey, message: "節點定義已刪除" });
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "節點定義不存在", {
        typeKey: req.params.typeKey,
      });
    }
    console.error("刪除節點定義失敗:", error);
    return errorResponse(res, 500, "刪除節點定義失敗", {
      detail: error.message,
      typeKey: req.params.typeKey,
    });
  }
};
