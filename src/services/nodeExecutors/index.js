/**
 * 節點執行器工廠
 * 負責根據節點類型創建對應的執行器
 */

// 引入所有執行器
const DataSourceExecutor = require("./dataSourceExecutor");
const TransformationExecutor = require("./transformationExecutor");
const AnalysisExecutor = require("./analysisExecutor");
const VisualizationExecutor = require("./visualizationExecutor");
const ExportExecutor = require("./exportExecutor");
const ComplaintSelectorExecutor = require("./complaintSelectorExecutor");

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
    console.log(
      "NodeExecutorFactory.executeNode 被調用，節點:",
      node.id,
      "類型:",
      node.type
    );
    console.log("輸入數據:", input);

    // 從節點類型或節點數據中獲取節點類型
    const nodeType = node.type || node.data?.type;

    console.log("確定的節點類型:", nodeType);

    // 如果是 ComplaintSelectorNode，使用特殊處理
    if (
      node.data?.label === "客訴單號選擇器" ||
      nodeType === "ComplaintSelectorNode"
    ) {
      console.log("使用 ComplaintSelectorExecutor 處理節點");
      return await ComplaintSelectorExecutor.execute(node, input, context);
    }

    try {
      const executor = this.getExecutor(nodeType);
      console.log("找到執行器:", nodeType);
      return await executor.execute(node, input, context);
    } catch (error) {
      console.error("執行器錯誤:", error.message);

      // 嘗試使用通用處理方式
      if (
        nodeType?.includes("DataSource") ||
        node.data?.category === "dataSource"
      ) {
        console.log("使用 DataSourceExecutor 處理節點");
        return await DataSourceExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Transform") ||
        node.data?.category === "transformation"
      ) {
        console.log("使用 TransformationExecutor 處理節點");
        return await TransformationExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Analysis") ||
        node.data?.category === "analysis"
      ) {
        console.log("使用 AnalysisExecutor 處理節點");
        return await AnalysisExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Visualization") ||
        node.data?.category === "visualization"
      ) {
        console.log("使用 VisualizationExecutor 處理節點");
        return await VisualizationExecutor.execute(node, input, context);
      } else if (
        nodeType?.includes("Export") ||
        node.data?.category === "export"
      ) {
        console.log("使用 ExportExecutor 處理節點");
        return await ExportExecutor.execute(node, input, context);
      } else {
        throw new Error(`無法找到適合節點類型 ${nodeType} 的執行器`);
      }
    }
  }
}

// 註冊所有執行器
NodeExecutorFactory.registerExecutor("DataSourceNode", DataSourceExecutor);
NodeExecutorFactory.registerExecutor(
  "TransformationNode",
  TransformationExecutor
);
NodeExecutorFactory.registerExecutor("AnalysisNode", AnalysisExecutor);
NodeExecutorFactory.registerExecutor(
  "VisualizationNode",
  VisualizationExecutor
);
NodeExecutorFactory.registerExecutor("ExportNode", ExportExecutor);
NodeExecutorFactory.registerExecutor(
  "ComplaintSelectorNode",
  ComplaintSelectorExecutor
);

module.exports = NodeExecutorFactory;
