/**
 * 分析節點執行器
 * 負責執行各種數據分析操作
 */
const externalApiService = require("../externalApiService");

const AnalysisExecutor = {
  /**
   * 執行分析節點
   * @param {Object} node - 節點對象
   * @param {Object} input - 輸入數據
   * @param {Object} context - 執行上下文
   * @returns {Promise<Object>} - 執行結果
   */
  execute: async (node, input, context) => {
    const { data } = node;
    const { analysisType } = data;

    console.log("執行分析節點:", { analysisType });

    switch (analysisType) {
      case "correlation":
        return await executeCorrelationAnalysis(input, data);
      case "anova":
        return await executeAnovaAnalysis(input, data);
      // 其他分析類型...
      default:
        throw new Error(`不支持的分析類型: ${analysisType}`);
    }
  },
};

/**
 * 執行相關性分析
 * @param {Object} input - 輸入數據
 * @param {Object} nodeData - 節點配置數據
 * @returns {Promise<Object>} - 分析結果
 */
async function executeCorrelationAnalysis(input, nodeData) {
  try {
    const result = await externalApiService.post("analysis/correlation", {
      data: input.dataset,
      parameters: nodeData.parameters,
    });

    return {
      ...input,
      analysisResult: result,
      correlationMatrix: result.correlationMatrix,
      significantPairs: result.significantPairs,
    };
  } catch (error) {
    console.error("相關性分析錯誤:", error);
    throw new Error(`相關性分析失敗: ${error.message}`);
  }
}

/**
 * 執行方差分析 (ANOVA)
 * @param {Object} input - 輸入數據
 * @param {Object} nodeData - 節點配置數據
 * @returns {Promise<Object>} - 分析結果
 */
async function executeAnovaAnalysis(input, nodeData) {
  try {
    const result = await externalApiService.post("analysis/anova", {
      data: input.dataset,
      parameters: nodeData.parameters,
    });

    return {
      ...input,
      analysisResult: result,
      anovaTable: result.anovaTable,
      pValue: result.pValue,
    };
  } catch (error) {
    console.error("方差分析錯誤:", error);
    throw new Error(`方差分析失敗: ${error.message}`);
  }
}

module.exports = AnalysisExecutor;
