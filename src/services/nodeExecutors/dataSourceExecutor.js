/**
 * 數據源節點執行器
 * 負責從不同類型的數據源獲取數據
 */
const DataSourceExecutor = {
  /**
   * 執行數據源節點
   * @param {Object} node - 節點對象
   * @param {Object} input - 輸入數據
   * @param {Object} context - 執行上下文
   * @returns {Promise<Object>} - 執行結果
   */
  execute: async (node, input, context) => {
    const { data } = node;
    const { sourceType, datasetId } = data;

    console.log("執行數據源節點:", { sourceType, datasetId });

    // 根據數據源類型獲取數據
    switch (sourceType) {
      case "dataset":
        // 從數據集獲取數據
        if (!datasetId) {
          throw new Error("未指定數據集ID");
        }
        // TODO: 實現從數據集獲取數據的邏輯
        return { dataset: { id: datasetId, columns: [], rows: [] } };
      // 其他數據源類型...
      default:
        throw new Error(`不支持的數據源類型: ${sourceType}`);
    }
  },
};

module.exports = DataSourceExecutor;
