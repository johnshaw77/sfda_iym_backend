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

  // 驗證 definitionKey
  if (!data.definitionKey) {
    errors.push("definitionKey 為必填欄位");
  } else {
    if (data.definitionKey.length < 5 || data.definitionKey.length > 30) {
      errors.push("definitionKey 長度必須在 5 到 30 個字元之間");
    }
    if (!/^[a-z][a-z0-9-]*$/.test(data.definitionKey)) {
      errors.push(
        "definitionKey 必須以小寫字母開頭，只能包含小寫字母、數字和連字符號"
      );
    }
    if (data.definitionKey.includes("--")) {
      errors.push("definitionKey 不能包含連續的連字符號");
    }
  }

  // 驗證 name
  if (!data.name) {
    errors.push("name 為必填欄位");
  } else if (data.name.length < 2 || data.name.length > 50) {
    errors.push("name 長度必須在 2 到 50 個字元之間");
  }

  // 驗證 category
  if (!data.category) {
    errors.push("category 為必填欄位");
  } else {
    const validCategories = [
      "business-input",
      "business-process",
      "statistical-analysis",
    ];
    if (!validCategories.includes(data.category)) {
      errors.push("無效的節點分類");
    }
  }

  // 驗證 nodeType
  if (!data.nodeType) {
    errors.push("nodeType 為必填欄位");
  } else {
    const validNodeTypes = [
      "custom-input",
      "custom-process",
      "http-request",
      "statistic-process",
    ];
    if (!validNodeTypes.includes(data.nodeType)) {
      errors.push(
        "nodeType 必須是 custom-input、custom-process 或 statistic-process"
      );
    }
  }

  // 驗證 description
  if (!data.description) {
    errors.push("description 為必填欄位");
  } else if (data.description.length < 2 || data.description.length > 200) {
    errors.push("description 長度必須在 2 到 200 個字元之間");
  } else if (data.description.trim().length === 0) {
    errors.push("description 不能只包含空白字符");
  }

  // 根據 nodeType 驗證必填欄位
  if (data.nodeType === "custom-input" && !data.componentName) {
    errors.push("custom-input 類型必須指定 componentName");
  }

  // 驗證 API 相關欄位
  if (["custom-process", "statistic-process"].includes(data.nodeType)) {
    if (!data.apiEndpoint) {
      errors.push("處理類型節點必須指定 API 端點");
    } else if (!data.apiEndpoint.startsWith("/")) {
      errors.push("API 端點必須以 / 開頭");
    }
  }

  if (data.apiEndpoint) {
    if (!data.apiMethod) {
      errors.push("當提供 apiEndpoint 時，apiMethod 為必填");
    } else if (!["GET", "POST", "PUT", "DELETE"].includes(data.apiMethod)) {
      errors.push("apiMethod 必須是 GET、POST、PUT 或 DELETE");
    }
  }

  return errors;
};

// JSON 欄位處理工具
const handleJsonField = (field, defaultValue = "{}") => {
  if (typeof field === "undefined" || field === null) {
    return defaultValue;
  }

  if (typeof field === "string") {
    try {
      // 驗證是否為有效的 JSON 字串
      JSON.parse(field);
      return field;
    } catch (e) {
      return defaultValue;
    }
  }

  try {
    return JSON.stringify(field);
  } catch (e) {
    console.warn("JSON 字串化失敗:", e);
    return defaultValue;
  }
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
    const { definitionKey } = req.params;
    const nodeDefinition = await prisma.nodeDefinition.findUnique({
      where: { definitionKey },
    });

    if (!nodeDefinition) {
      return errorResponse(res, 404, "節點定義不存在", {
        definitionKey,
      });
    }

    return successResponse(res, 200, nodeDefinition);
  } catch (error) {
    console.error("獲取節點定義失敗:", error);
    return errorResponse(res, 500, "獲取節點定義失敗", {
      detail: error.message,
      definitionKey: req.params.definitionKey,
    });
  }
};

// 創建節點定義
exports.createNodeDefinition = async (req, res) => {
  try {
    const {
      definitionKey,
      nodeType,
      name,
      category,
      description,
      version,
      componentName,
      componentPath,
      apiEndpoint,
      apiMethod,
      config,
      uiConfig,
      validation,
      handles,
    } = req.body;

    // 驗證欄位
    const validationErrors = validateNodeDefinition(req.body);
    if (validationErrors.length > 0) {
      return errorResponse(res, 400, "驗證失敗", validationErrors);
    }

    // 檢查 definitionKey 是否已存在
    const existing = await prisma.nodeDefinition.findUnique({
      where: { definitionKey },
    });

    if (existing) {
      return errorResponse(res, 400, "節點定義鍵值已存在", {
        definitionKey,
      });
    }

    // 創建節點定義
    const nodeDefinition = await prisma.nodeDefinition.create({
      data: {
        definitionKey,
        nodeType,
        name,
        category,
        description,
        version: version || "1.0.0",
        componentName,
        componentPath,
        apiEndpoint,
        apiMethod,
        config: handleJsonField(config),
        uiConfig: handleJsonField(uiConfig),
        validation: handleJsonField(validation),
        handles: handleJsonField(handles),
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
    const { definitionKey } = req.params;
    const {
      nodeType,
      name,
      category,
      description,
      version,
      componentName,
      componentPath,
      apiEndpoint,
      apiMethod,
      config,
      uiConfig,
      validation,
      handles,
    } = req.body;

    // 驗證欄位
    const validationErrors = validateNodeDefinition({
      definitionKey,
      ...req.body,
    });
    if (validationErrors.length > 0) {
      return errorResponse(res, 400, "驗證失敗", validationErrors);
    }

    const nodeDefinition = await prisma.nodeDefinition.update({
      where: { definitionKey },
      data: {
        nodeType,
        name,
        category,
        description,
        version,
        componentName,
        componentPath,
        apiEndpoint,
        apiMethod,
        config: handleJsonField(config),
        uiConfig: handleJsonField(uiConfig),
        validation: handleJsonField(validation),
        handles: handleJsonField(handles),
      },
    });

    return successResponse(res, 200, nodeDefinition);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "節點定義不存在", {
        definitionKey: req.params.definitionKey,
      });
    }
    console.error("更新節點定義失敗:", error);
    return errorResponse(res, 500, "更新節點定義失敗", {
      detail: error.message,
      definitionKey: req.params.definitionKey,
      data: req.body,
    });
  }
};

// 刪除節點定義
exports.deleteNodeDefinition = async (req, res) => {
  try {
    const { definitionKey } = req.params;

    const result = await prisma.nodeDefinition.delete({
      where: { definitionKey },
    });

    return successResponse(res, 200, {
      definitionKey,
      message: "節點定義已刪除",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "節點定義不存在", {
        definitionKey: req.params.definitionKey,
      });
    }
    console.error("刪除節點定義失敗:", error);
    return errorResponse(res, 500, "刪除節點定義失敗", {
      detail: error.message,
      definitionKey: req.params.definitionKey,
    });
  }
};
