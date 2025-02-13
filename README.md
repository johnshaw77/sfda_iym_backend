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
   - [x] 密碼加密存儲
   - [x] 頭像上傳與管理
   - [x] 用戶資料更新
   - [x] 會話管理

## 角色權限系統（RBAC）

### 預設角色

1. ADMIN
   - 描述：系統管理員，具有所有權限
   - 權限：完整的系統管理權限

2. POWERUSER
   - 描述：進階用戶，具有大部分權限
   - 權限：除了系統管理外的大部分操作權限

3. READER
   - 描述：一般讀者，具有基本讀取權限
   - 權限：基本的讀取和查看權限

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

- Node.js & Express.js
- Prisma ORM
- SQLite 資料庫
- JWT 認證
- bcrypt 密碼加密
- Express Validator
- Swagger API 文檔
- Multer 檔案上傳
- Sharp 圖片處理

## 資料庫設計

### 用戶表 (User)
- id: 唯一識別碼
- username: 用戶名
- email: 電子郵件
- password: 加密密碼
- role: 用戶角色 (admin/user)
- avatar: 頭像路徑
- isActive: 帳號狀態
- createdAt: 創建時間
- updatedAt: 更新時間

## 版本資訊

- 當前版本：1.2.0
- 最後更新：2024-03-21
- 更新內容：
  1. 優化檔案上傳功能
     - 改進檔案命名邏輯
     - 優化檔案存儲結構
     - 添加自動清理機制
  2. 增強用戶系統
     - 完善頭像管理功能
     - 優化用戶資料更新
     - 改進權限控制
  3. 安全性更新
     - 加強檔案類型驗證
     - 優化錯誤處理
     - 改進日誌記錄
  4. 性能優化
     - 改進資料庫查詢
     - 優化檔案處理
     - 加強快取機制

## 開發指南

1. 安裝依賴
```bash
npm install
```

2. 設置環境變數
```bash
cp .env.example .env
```

3. 初始化資料庫
```bash
npx prisma migrate dev
```

4. 初始化角色和測試用戶
```bash
npm run prisma:seed
```

5. 啟動開發服務器
```bash
npm run dev
```

## API 文檔

訪問 `http://localhost:3000/api-docs` 查看完整 API 文檔

## 其它

- 生成 JWT_SECRET
```bash
openssl rand -hex 64
```

- 訪問 Prisma Studio 查看數據
```bash
npx prisma studio
```

## 其它 ###
- 訪問 `http://localhost:3000/api/users` 查看用戶列表
- 訪問 `http://localhost:3000/api/users/1` 查看用戶詳細資訊
- 訪問 `http://localhost:3000/api/users/1` 更新用戶資訊
- 訪問 `http://localhost:3000/api/users/1` 刪除用戶

## API 文檔

訪問 `http://localhost:3000/api-docs` 查看完整 API 文檔 