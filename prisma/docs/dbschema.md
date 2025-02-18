# SFDA IYM 資料庫結構文檔

## 使用者管理

### User（使用者）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 使用者唯一識別碼 | @id @default(uuid()) |
| username | String | 使用者名稱 | @unique |
| email | String | 電子郵件 | @unique |
| password | String | 密碼 | 加密儲存 |
| avatar | String | 頭像 | 可為空 |
| isActive | Boolean | 是否啟用 | @default(true) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### Role（角色）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 角色唯一識別碼 | @id @default(uuid()) |
| name | String | 角色名稱 | @unique |
| description | String | 角色描述 | |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### Permission（權限）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 權限唯一識別碼 | @id @default(uuid()) |
| name | String | 權限名稱 | @unique |
| description | String | 權限描述 | |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### UserRole（使用者角色關聯）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| userId | String | 使用者 ID | @relation(fields: [userId], references: [id]) |
| roleId | String | 角色 ID | @relation(fields: [roleId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### RolePermission（角色權限關聯）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| roleId | String | 角色 ID | @relation(fields: [roleId], references: [id]) |
| permissionId | String | 權限 ID | @relation(fields: [permissionId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

## 系統管理

### SystemCode（系統代碼）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 系統代碼唯一識別碼 | @id @default(uuid()) |
| systemCode | String | 系統代碼 | @unique |
| systemName | String | 系統名稱 | |
| systemDescription | String | 系統描述 | |
| isEnabled | Boolean | 是否啟用 | @default(true) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |
| createdBy | String | 建立者 ID | @relation(fields: [createdBy], references: [id]) |
| updatedBy | String | 更新者 ID | @relation(fields: [updatedBy], references: [id]) |

## 專案管理

### Project（專案）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 專案唯一識別碼 | @id @default(uuid()) |
| name | String | 專案名稱 | |
| description | String | 專案描述 | |
| status | String | 專案狀態 | @default("draft") |
| systemCode | String | 系統代碼 | @relation(fields: [systemCode], references: [systemCode]) |
| projectNumber | String | 專案編號 | @unique |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |
| createdBy | String | 建立者 ID | @relation(fields: [createdBy], references: [id]) |
| updatedBy | String | 更新者 ID | @relation(fields: [updatedBy], references: [id]) |

## 工作流程管理

### WorkflowTemplate（工作流程範本）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 範本唯一識別碼 | @id @default(uuid()) |
| templateName | String | 範本名稱 | |
| description | String | 範本描述 | |
| templateCategory | String | 範本分類 | |
| version | String | 版本號 | |
| status | String | 狀態 | @default("DRAFT") |
| config | Json | 配置資訊 | |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |
| creatorId | String | 建立者 ID | @relation(fields: [creatorId], references: [id]) |

### NodeDefinition（節點定義）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 節點定義唯一識別碼 | @id @default(uuid()) |
| definitionKey | String | 定義鍵值 | @unique |
| name | String | 節點名稱 | |
| description | String | 節點描述 | |
| category | String | 節點分類 | |
| version | String | 版本號 | |
| config | Json | 配置資訊 | |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### NodeTemplate（節點範本）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 節點範本唯一識別碼 | @id @default(uuid()) |
| nodeName | String | 節點名稱 | |
| positionX | Float | X 座標位置 | |
| positionY | Float | Y 座標位置 | |
| config | Json | 配置資訊 | |
| workflowTemplateId | String | 工作流程範本 ID | @relation(fields: [workflowTemplateId], references: [id]) |
| nodeTypeId | String | 節點類型 ID | @relation(fields: [nodeTypeId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### NodeTemplateConnection（節點範本連接）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 連接唯一識別碼 | @id @default(uuid()) |
| edgeType | String | 連接類型 | |
| workflowTemplateId | String | 工作流程範本 ID | @relation(fields: [workflowTemplateId], references: [id]) |
| sourceNodeId | String | 來源節點 ID | @relation(fields: [sourceNodeId], references: [id]) |
| targetNodeId | String | 目標節點 ID | @relation(fields: [targetNodeId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### WorkflowInstance（工作流程實例）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 實例唯一識別碼 | @id @default(uuid()) |
| status | String | 狀態 | @default("CREATED") |
| startTime | DateTime | 開始時間 | |
| endTime | DateTime | 結束時間 | |
| workflowTemplateId | String | 工作流程範本 ID | @relation(fields: [workflowTemplateId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### NodeInstance（節點實例）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 實例唯一識別碼 | @id @default(uuid()) |
| status | String | 狀態 | @default("PENDING") |
| startTime | DateTime | 開始時間 | |
| endTime | DateTime | 結束時間 | |
| result | Json | 執行結果 | |
| workflowInstanceId | String | 工作流程實例 ID | @relation(fields: [workflowInstanceId], references: [id]) |
| nodeTemplateId | String | 節點範本 ID | @relation(fields: [nodeTemplateId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### NodeInstanceConnection（節點實例連接）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 連接唯一識別碼 | @id @default(uuid()) |
| status | String | 狀態 | @default("PENDING") |
| workflowInstanceId | String | 工作流程實例 ID | @relation(fields: [workflowInstanceId], references: [id]) |
| sourceNodeInstanceId | String | 來源節點實例 ID | @relation(fields: [sourceNodeInstanceId], references: [id]) |
| targetNodeInstanceId | String | 目標節點實例 ID | @relation(fields: [targetNodeInstanceId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

## 檔案管理

### File（檔案）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 檔案唯一識別碼 | @id @default(uuid()) |
| filename | String | 檔案名稱 | |
| originalName | String | 原始檔名 | |
| mimeType | String | MIME 類型 | |
| size | Int | 檔案大小 | |
| path | String | 儲存路徑 | |
| uploaderId | String | 上傳者 ID | @relation(fields: [uploaderId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

### FileNode（檔案節點關聯）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 關聯唯一識別碼 | @id @default(uuid()) |
| fileId | String | 檔案 ID | @relation(fields: [fileId], references: [id]) |
| nodeInstanceId | String | 節點實例 ID | @relation(fields: [nodeInstanceId], references: [id]) |
| type | String | 關聯類型 | |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt |

## 系統日誌

### ApiLog（API 日誌）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 日誌唯一識別碼 | @id @default(uuid()) |
| method | String | HTTP 方法 | |
| path | String | 請求路徑 | |
| status | Int | 狀態碼 | |
| requestBody | Json | 請求內容 | |
| responseBody | Json | 響應內容 | |
| duration | Int | 處理時間 | |
| userId | String | 使用者 ID | @relation(fields: [userId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |

### DataSnapshot（資料快照）
| 欄位名稱 | 型別 | 說明 | 備註 |
|---------|------|------|------|
| id | String | 快照唯一識別碼 | @id @default(uuid()) |
| type | String | 快照類型 | |
| data | Json | 快照資料 | |
| nodeInstanceId | String | 節點實例 ID | @relation(fields: [nodeInstanceId], references: [id]) |
| createdAt | DateTime | 建立時間 | @default(now()) |
| updatedAt | DateTime | 更新時間 | @updatedAt | 