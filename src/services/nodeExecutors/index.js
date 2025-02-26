/**
 * 節點執行器工廠
 * 負責根據節點類型創建對應的執行器
 */
class NodeExecutorFactory {
  static executors = {};

  /**
   * 註冊執行器
   * @param {string} nodeType - 節點類型
   * @param {object} executor - 執行器
   */
  static registerExecutor(nodeType, executor) {
    this.executors[nodeType] = executor;
  }

  /**
   * 獲取執行器
   * @param {string} nodeType - 節點類型
   * @returns {object} - 執行器
   */
  static getExecutor(nodeType) {
    const executor = this.executors[nodeType];
    if (!executor) {
      throw new Error(`不支持的節點類型: ${nodeType}`);
    }
    return executor;
  }

  /**
   * 執行節點
   * @param {object} node - 節點
   * @param {object} input - 輸入數據
   * @param {object} context - 上下文
   * @returns {Promise<object>} - 執行結果
   */
  static async executeNode(node, input, context) {
    // 從節點類型或節點數據中獲取節點類型
    const nodeType = node.type || node.data?.type;

    // 如果是 ComplaintSelectorNode，使用特殊處理
    if (
      node.data?.label === "客訴單號選擇器" ||
      nodeType === "ComplaintSelectorNode"
    ) {
      return await ComplaintSelectorExecutor.execute(node, input, context);
    }

    try {
      const executor = this.getExecutor(nodeType);
      return await executor.execute(node, input, context);
    } catch (error) {
      // 嘗試使用通用處理方式
      if (
        nodeType?.includes("DataSource") ||
        node.data?.category === "dataSource"
      ) {
        return await DataSourceExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Transform") ||
        node.data?.category === "transformation"
      ) {
        return await TransformationExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Analysis") ||
        node.data?.category === "analysis"
      ) {
        return await AnalysisExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Visualization") ||
        node.data?.category === "visualization"
      ) {
        return await VisualizationExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Export") ||
        node.data?.category === "export"
      ) {
        return await ExportExecutor.execute(node, input, context);
      } else {
        throw new Error(`無法找到適合節點類型 ${nodeType} 的執行器`);
      }
    }
  }
}

// 導入所有執行器
const DataSourceExecutor = require("./dataSourceExecutor");
const TransformationExecutor = require("./transformationExecutor");
const AnalysisExecutor = require("./analysisExecutor");
const VisualizationExecutor = require("./visualizationExecutor");
const ExportExecutor = require("./exportExecutor");
const ComplaintSelectorExecutor = require("./complaintSelectorExecutor");

// 註冊所有執行器
NodeExecutorFactory.registerExecutor("dataSource", DataSourceExecutor);
NodeExecutorFactory.registerExecutor("transformation", TransformationExecutor);
NodeExecutorFactory.registerExecutor("analysis", AnalysisExecutor);
NodeExecutorFactory.registerExecutor("visualization", VisualizationExecutor);
NodeExecutorFactory.registerExecutor("export", ExportExecutor);
NodeExecutorFactory.registerExecutor(
  "ComplaintSelectorNode",
  ComplaintSelectorExecutor
);

module.exports = NodeExecutorFactory;
