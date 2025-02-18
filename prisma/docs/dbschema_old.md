# 資料庫架構設計

## 1. 節點類型表 (NodeType)
```sql
NodeType
- id (PK)                    // 節點類型唯一識別碼
- typeKey                    // 節點類型鍵值（如 'complaint_selector', 'data_analyzer'）
- category                   // 類別（初始節點、分析節點、輸出節點）
- nodeName                   // 節點類型名稱
- description               // 節點類型描述
- componentName             // 對應的 Vue 組件名稱
- defaultConfig             // 預設配置（JSON，包含預設參數、樣式等）
- apiEndpoint               // API端點
- apiMethod                 // API方法
- inputSchema               // 輸入參數架構（JSON）
- outputSchema              // 輸出結果架構（JSON）
- uiSchema                  // UI配置架構（JSON，定義前端如何渲染表單）
- icon                      // 圖示
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 2. 工作流程範本表 (WorkflowTemplate)
```sql
WorkflowTemplate
- id (PK)                    // 工作流程範本唯一識別碼
- templateName              // 範本名稱（如「客訴分析範本」）
- templateCategory          // 範本分類
- description               // 範本描述
- version                   // 版本號
- status                    // 狀態（草稿、發布、棄用）
- config                    // 範本整體配置（JSON，可包含畫布大小等）
- createdBy                 // 創建者ID
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 3. 節點範本表 (NodeTemplate)
```sql
NodeTemplate
- id (PK)                    // 節點範本唯一識別碼
- workflowTemplateId (FK)    // 關聯的工作流程範本ID
- nodeTypeId (FK)            // 關聯的節點類型ID
- nodeName                   // 節點實例名稱
- positionX                  // X座標位置（vue-flow用）
- positionY                  // Y座標位置（vue-flow用）
- config                     // 節點配置（JSON，覆蓋或擴展 defaultConfig）
- style                     // 節點樣式（JSON，vue-flow節點樣式）
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 4. 節點連接範本表 (NodeTemplateConnection)
```sql
NodeTemplateConnection
- id (PK)                    // 連接唯一識別碼
- workflowTemplateId (FK)    // 關聯的工作流程範本ID
- sourceNodeId (FK)          // 來源節點ID
- targetNodeId (FK)          // 目標節點ID
- edgeType                   // 連接線類型（對應vue-flow的edge type）
- label                     // 連接線標籤
- condition                  // 連接條件（JSON）
- style                     // 連接線樣式（JSON）
- mappingConfig             // 數據映射配置（JSON）
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 5. 工作流程實例表 (WorkflowInstance)
```sql
WorkflowInstance
- id (PK)                    // 工作流程實例唯一識別碼
- templateId (FK)            // 關聯的工作流程範本ID
- projectId (FK)             // 關聯的專案ID
- instanceName              // 實例名稱
- status                    // 執行狀態
- startTime                 // 開始時間
- endTime                   // 結束時間
- initiator                 // 發起人ID
- initialData               // 初始數據（JSON）
- executionContext          // 執行上下文（JSON）
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 6. 節點實例表 (NodeInstance)
```sql
NodeInstance
- id (PK)                    // 節點實例唯一識別碼
- workflowInstanceId (FK)    // 關聯的工作流程實例ID
- nodeTemplateId (FK)        // 關聯的節點範本ID
- status                     // 執行狀態
- startTime                 // 開始時間
- endTime                   // 結束時間
- retryCount               // 重試次數
- errorMessage              // 錯誤訊息
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 7. 節點實例連接表 (NodeInstanceConnection)
```sql
NodeInstanceConnection
- id (PK)                    // 連接實例唯一識別碼
- workflowInstanceId (FK)    // 關聯的工作流程實例ID
- templateConnectionId (FK)  // 關聯的範本連接ID
- sourceNodeId (FK)          // 來源節點實例ID
- targetNodeId (FK)          // 目標節點實例ID
- status                     // 執行狀態
- executedAt                // 執行時間
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 8. 檔案節點表 (FileNode)
```sql
FileNode
- id (PK)                    // 唯一識別碼
- workflowInstanceId (FK)    // 關聯的工作流程實例ID
- fileName                   // 檔案名稱
- originalName              // 原始檔案名稱
- fileUrl                   // 檔案存放路徑
- fileSize                  // 檔案大小
- thumbnailPath             // 縮圖路徑（可為空）
- fileType                  // 檔案類型（結案報告、不良照片等）
- status                    // 狀態（pending, processing, completed, error）
- positionX                 // X座標位置（vue-flow用）
- positionY                 // Y座標位置（vue-flow用）
- style                     // 節點樣式（JSON，vue-flow節點樣式）
- description               // 描述
- uploadedBy                // 上傳者ID
- createdAt                 // 創建時間
- updatedAt                 // 更新時間
```

## 下一步建議動作：

1. **建立 Prisma Schema**
   - 將此資料庫設計轉換為 Prisma schema 格式
   - 定義具體的欄位類型和關聯關係
   - 設定索引和約束

2. **建立基礎節點類型**
   - 定義常用的節點類型（如客訴選擇、數據分析等）
   - 設計對應的前端組件
   - 規劃 API 端點

3. **開發工作流程範本管理功能**
   - 實現範本的 CRUD 操作
   - 開發範本設計器介面
   - 實現節點拖放和連接功能

4. **開發工作流程執行引擎**
   - 實現工作流程實例化邏輯
   - 開發節點執行機制
   - 設計數據流轉邏輯

5. **開發監控和日誌系統**
   - 實現工作流程執行狀態追蹤
   - 開發執行日誌記錄功能
   - 設計監控儀表板

您想要從哪個部分開始著手？ 