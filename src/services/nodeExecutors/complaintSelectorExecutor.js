/**
 * 客訴選擇器節點執行器
 * 負責處理客訴選擇器節點的執行邏輯
 */
class ComplaintSelectorExecutor {
  /**
   * 執行客訴選擇器節點
   * @param {object} node - 節點
   * @param {object} input - 輸入數據
   * @param {object} context - 上下文
   * @returns {Promise<object>} - 執行結果
   */
  static async execute(node, input, context) {
    try {
      console.log("執行客訴選擇器節點:", node.id);
      console.log("輸入數據:", input);
      console.log("節點數據:", node.data);

      // 從輸入數據或節點數據中獲取客訴單號
      let complaintId = input.complaintId;
      let complaintDetail = input.complaintDetail;

      // 如果輸入數據中沒有客訴單號，嘗試從節點數據中獲取
      if (!complaintId && node.data) {
        complaintId = node.data.complaintId;
        complaintDetail = node.data.complaintDetail;
      }

      // 驗證輸入數據
      if (!complaintId) {
        throw new Error("缺少必要的客訴單號");
      }

      // 這裡可以添加實際的業務邏輯，例如從數據庫獲取更詳細的客訴信息
      // 或者進行其他處理

      // 返回處理結果
      return {
        complaintId,
        complaintDetail,
        processedAt: new Date().toISOString(),
        status: "processed",
        message: `客訴單號 ${complaintId} 已成功處理`,
      };
    } catch (error) {
      console.error("客訴選擇器節點執行錯誤:", error);
      throw error;
    }
  }
}

module.exports = ComplaintSelectorExecutor;
