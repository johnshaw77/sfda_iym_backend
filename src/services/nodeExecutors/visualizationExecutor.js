/**
 * 可視化節點執行器
 * 負責生成各種圖表配置
 */
const VisualizationExecutor = {
  /**
   * 執行可視化節點
   * @param {Object} node - 節點對象
   * @param {Object} input - 輸入數據
   * @param {Object} context - 執行上下文
   * @returns {Promise<Object>} - 執行結果
   */
  execute: async (node, input, context) => {
    const { data } = node;
    const { visualizationType } = data;

    console.log("執行可視化節點:", { visualizationType });

    // 根據可視化類型生成圖表配置
    switch (visualizationType) {
      case "bar":
        return generateBarChartConfig(input, data);
      case "line":
        return generateLineChartConfig(input, data);
      case "scatter":
        return generateScatterChartConfig(input, data);
      case "pie":
        return generatePieChartConfig(input, data);
      // 其他可視化類型...
      default:
        throw new Error(`不支持的可視化類型: ${visualizationType}`);
    }
  },
};

/**
 * 生成柱狀圖配置
 * @param {Object} input - 輸入數據
 * @param {Object} nodeData - 節點配置數據
 * @returns {Object} - 圖表配置
 */
function generateBarChartConfig(input, nodeData) {
  return {
    ...input,
    chartConfig: {
      type: "bar",
      data: input.dataset,
      options: nodeData.options || {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: nodeData.title || "柱狀圖",
          },
        },
      },
    },
  };
}

/**
 * 生成折線圖配置
 * @param {Object} input - 輸入數據
 * @param {Object} nodeData - 節點配置數據
 * @returns {Object} - 圖表配置
 */
function generateLineChartConfig(input, nodeData) {
  return {
    ...input,
    chartConfig: {
      type: "line",
      data: input.dataset,
      options: nodeData.options || {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: nodeData.title || "折線圖",
          },
        },
      },
    },
  };
}

/**
 * 生成散點圖配置
 * @param {Object} input - 輸入數據
 * @param {Object} nodeData - 節點配置數據
 * @returns {Object} - 圖表配置
 */
function generateScatterChartConfig(input, nodeData) {
  return {
    ...input,
    chartConfig: {
      type: "scatter",
      data: input.dataset,
      options: nodeData.options || {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: nodeData.title || "散點圖",
          },
        },
      },
    },
  };
}

/**
 * 生成餅圖配置
 * @param {Object} input - 輸入數據
 * @param {Object} nodeData - 節點配置數據
 * @returns {Object} - 圖表配置
 */
function generatePieChartConfig(input, nodeData) {
  return {
    ...input,
    chartConfig: {
      type: "pie",
      data: input.dataset,
      options: nodeData.options || {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: nodeData.title || "餅圖",
          },
        },
      },
    },
  };
}

module.exports = VisualizationExecutor;
