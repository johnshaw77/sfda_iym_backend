# SFDA (Statistical Flow-based Data Analysis) Backend

這是一個基於 FastAPI 的統計分析工作流程系統後端專案。

## 專案說明
SFDA IYM（良率分析平台）後端服務，使用 Node.js + Express + Prisma 開發，提供 RESTful API 服務。

## 已完成功能

1. 檔案管理
   - [x] 檔案上傳
     - 支援拖拉上傳
     - 自動檔案命名
     - 檔案類型驗證
     - 檔案大小限制
   - [x] 檔案下載
   - [x] 檔案刪除
   - [x] 檔案類型驗證
   - [x] 檔案大小限制
   - [x] 支援多種檔案格式
     - 圖片：JPEG、PNG、GIF
     - 文件：PDF、TXT、CSV、JSON
     - Office：PPT、PPTX、XLS、XLSX
   - [x] 檔案存儲優化
   - [x] 自動清理臨時檔案

2. API 功能
   - [x] RESTful API 設計
   - [x] 錯誤處理機制
   - [x] 請求驗證
   - [x] 響應格式統一
   - [x] API 文檔（Swagger）
   - [x] 檔案上傳進度追蹤
   - [x] 大檔案分片上傳

3. 用戶認證系統
   - [x] JWT 身份驗證
   - [x] 用戶註冊/登入
   - [x] 權限控制（RBAC）
     - 完整的角色管理
     - 靈活的權限分配
     - 用戶角色關聯
     - 角色權限繼承
   - [x] 密碼加密存儲
   - [x] 頭像上傳與管理
   - [x] 用戶資料更新
   - [x] 會話管理

## 角色權限系統（RBAC）

### 角色類型

1. SUPER_ADMIN
   - 描述：超級管理員，具有最高權限
   - 權限：系統配置、用戶管理、角色管理、權限分配等所有權限

2. ADMIN
   - 描述：管理員，具有管理權限
   - 權限：用戶管理、角色分配等管理權限

3. POWERUSER
   - 描述：進階用戶，具有大部分操作權限
   - 權限：除了系統管理外的大部分操作權限

4. READER
   - 描述：一般讀者，具有基本讀取權限
   - 權限：基本的讀取和查看權限

### 權限特性

- 角色繼承：上級角色自動繼承下級角色的所有權限
- 權限疊加：用戶可以擁有多個角色，權限自動疊加
- 靈活分配：支援動態調整用戶角色
- 即時生效：角色變更即時生效，無需重新登入

### 預設用戶

#### 管理員帳號
| 用戶名 | 電子郵件 | 密碼 | 角色 |
|--------|----------|------|------|
| john_hsiao | john_hsiao@example.com | 888888 | ADMIN |

#### 測試用戶
所有測試用戶的預設密碼：`User123456`

| 用戶名 | 電子郵件 | 角色 |
|--------|----------|------|
| user1  | user1@example.com | 隨機分配（POWERUSER/READER）|
| user2  | user2@example.com | 隨機分配（POWERUSER/READER）|
| user3  | user3@example.com | 隨機分配（POWERUSER/READER）|
| user4  | user4@example.com | 隨機分配（POWERUSER/READER）|
| user5  | user5@example.com | 隨機分配（POWERUSER/READER）|
| user6  | user6@example.com | 隨機分配（POWERUSER/READER）|
| user7  | user7@example.com | 隨機分配（POWERUSER/READER）|
| user8  | user8@example.com | 隨機分配（POWERUSER/READER）|
| user9  | user9@example.com | 隨機分配（POWERUSER/READER）|
| user10 | user10@example.com | 隨機分配（POWERUSER/READER）|

角色分配規則：
- POWERUSER：30% 機率
- READER：70% 機率

## 技術棧

- **核心框架：** Node.js 16.0.0 + Express 4.18.2 + Prisma ORM 5.10.2
- **資料庫：** PostgreSQL 14.0
- **認證：** JWT + bcrypt
- **檔案處理：** Multer 1.4.5 + Sharp 0.33.2
- **API文檔：** Swagger UI Express 5.0.0
- **日誌：** Winston 3.11.0
- **測試：** Jest 29.7.0 + Supertest 6.3.4

## 系統架構

```
backend/
├── src/                # 源代碼目錄
│   ├── config/        # 配置文件
│   ├── controllers/   # 控制器
│   ├── middlewares/   # 中間件
│   ├── models/        # 數據模型
│   ├── routes/        # 路由定義
│   ├── services/      # 業務邏輯
│   └── utils/         # 工具函數
├── prisma/            # Prisma 配置和遷移
├── tests/             # 測試文件
├── uploads/           # 上傳文件存儲
└── docs/             # API 文檔
```

## 主要功能

### 1. 用戶認證系統
- JWT 身份驗證
- 角色權限控制（RBAC）
- 密碼加密存儲
- 會話管理
- 用戶資料管理

### 2. 檔案管理系統
- 多格式文件支持
- 自動文件驗證
- 安全存儲機制
- 檔案訪問控制
- 自動清理機制

### 3. RBAC 權限系統
- 角色管理
- 權限分配
- 訪問控制
- 操作日誌
- 權限繼承

### 4. API 安全機制
- 請求驗證
- 速率限制
- CORS 配置
- 錯誤處理
- 日誌記錄

## 開發指南

### 開發環境要求
- Node.js >= 16.0.0
- npm >= 7.0.0
- PostgreSQL >= 14.0

### 安裝與運行
```bash
# 安裝依賴
npm install

# 初始化數據庫
npx prisma migrate dev

# 開發環境運行
npm run dev

# 生產環境運行
npm start

# 運行測試
npm test
```

## API 文檔

啟動服務後訪問：`http://localhost:3001/api-docs`

## 更新日誌

### v1.3.1 (2025-02-18)
- 優化檔案處理系統
  - 改進頭像上傳功能
  - 加強文件驗證機制
  - 優化錯誤處理流程
- 改進 RBAC 系統
  - 優化角色權限管理
  - 改進用戶角色分配
  - 加強權限驗證
- 系統性能優化
  - 改進資料庫查詢效率
  - 優化檔案存儲機制
  - 加強快取處理

### v1.3.0 (2025-02-15)
- 新增完整的 RBAC 權限管理
- 優化資料庫結構
- 改進 API 響應機制
- 加強安全性配置

### v1.2.0 (2025-02-11)
- 新增文件管理功能
- 優化認證機制
- 改進錯誤處理
- 新增日誌系統

### v1.1.0 (2025-02-9)
- 新增用戶管理功能
- 完善 API 文檔
- 優化性能
- 改進開發體驗

### v1.0.0 (2025-02-7)
- 初始版本發布
- 基礎功能實現
- 核心架構搭建
- 基本 API 實現

## 測試

```bash
# 運行所有測試
npm test

# 運行特定測試
npm test -- users.test.js

# 測試覆蓋率報告
npm run test:coverage
```

## 部署

1. 建構專案
```bash
npm run build
```

2. 設置環境變數
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
```

3. 啟動服務
```bash
npm start
```

## 維護團隊

- 後端開發：backend@example.com
- 系統維護：ops@example.com
- 技術支持：support@example.com

## 授權說明

本專案為私有軟體，未經授權不得使用、複製或分發。

## 最新更新
- 優化認證系統
- 改進登出機制
- 移除不必要的認證要求
- 優化錯誤處理
- 改進用戶會話管理

## 開發規範
- 使用 ESLint 進行代碼檢查
- 遵循 RESTful API 設計規範
- 使用 async/await 處理異步
- 統一錯誤處理
- 完整的日誌記錄

## 環境變數
```env
# 應用配置
PORT=3001
NODE_ENV=development

# 數據庫配置
DATABASE_URL="postgresql://user:password@localhost:5432/sfda_iym"

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REMEMBER_EXPIRES_IN=7d

# 文件上傳配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

## 貢獻指南
1. Fork 本專案
2. 創建特性分支
3. 提交變更
4. 推送到分支
5. 創建 Pull Request

## 授權
本專案採用 MIT 授權條款 