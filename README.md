# SFDA IYM 前端專案

## 專案概述

SFDA IYM 是一個現代化的良率分析系統，提供直觀的用戶界面和強大的分析功能。本專案採用 Vue 3 + Element Plus 開發，具有高度的可擴展性和維護性。

## 技術棧

- **核心框架：** Vue 3 + Vite
- **UI 框架：** Element Plus
- **路由管理：** Vue Router
- **HTTP 客戶端：** Axios
- **樣式解決方案：** Tailwind CSS
- **圖標：** Lucide Icons + Element Plus Icons
- **進度條：** NProgress
- **開發語言：** JavaScript

## 主要功能

1. **專案管理**
   - 專案列表與詳情
   - 專案狀態追蹤
   - 專案成員管理
   - 專案數據分析

2. **用戶認證系統**
   - 登入/登出功能
   - 記住我功能（支持7天自動登入）
   - JWT Token 認證
   - 權限控制

3. **工作流程**
   - 工作流程設計
   - 流程執行與監控
   - 狀態追蹤
   - 數據收集

4. **用戶個人化**
   - 頭像上傳（支援拖拉上傳）
   - 個人資料管理
   - 主題設定
   - 通知偏好設定

5. **檔案管理**
   - 檔案上傳（支援拖拉上傳）
   - 檔案預覽
   - 檔案下載
   - 檔案刪除

6. **數據分析**
   - 數據可視化
   - 報表生成
   - 趨勢分析
   - 預測模型

## 檔案系統欄位說明

檔案系統使用以下欄位來管理檔案資訊：

- `fileName`: 系統生成的檔案名稱
- `originalname`: 原始檔案名稱
- `fileUrl`: 檔案存取路徑
- `fileSize`: 檔案大小（bytes）
- `fileType`: 檔案類型（MIME type）
- `thumbnailPath`: 縮圖路徑（如果有）
- `workflowId`: 關聯的工作流程 ID
- `status`: 檔案狀態（pending/processing/completed/error）
- `metadata`: 檔案元數據（JSON 格式）

## 專案結構

```
src/
├── api/            # API 請求模組
│   ├── modules/    # API 模組化管理
│   └── request.js  # Axios 配置
├── assets/         # 靜態資源
├── components/     # 共用元件
│   ├── AppHeader.vue    # 頂部導航
│   └── AppSidebar.vue   # 側邊導航
├── layouts/        # 頁面布局
│   ├── MainLayout.vue   # 主要布局
│   └── BlankLayout.vue  # 空白布局
├── router/         # 路由配置
├── views/          # 頁面組件
│   ├── auth/       # 認證相關
│   ├── projects/   # 專案管理
│   ├── workflow/   # 工作流程
│   ├── files/      # 檔案管理
│   └── analysis/   # 數據分析
└── main.js         # 入口文件
```

## 開始使用

1. **安裝依賴**
```bash
npm install
```

2. **開發環境運行**
```bash
npm run dev
```

3. **生產環境構建**
```bash
npm run build
```

## 環境變數配置

在 `.env` 文件中配置以下環境變數：

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=SFDA IYM
VITE_APP_ENV=development
```

## 開發規範

1. **命名規範**
   - 組件名稱：PascalCase（如 `AppHeader.vue`）
   - 文件名稱：kebab-case（如 `main-layout.vue`）
   - 變量命名：camelCase
   - 常量命名：UPPER_CASE

2. **代碼風格**
   - 使用 ESLint 進行代碼檢查
   - 使用 Prettier 進行代碼格式化
   - 遵循 Vue 3 組合式 API 風格指南

3. **組件開發規範**
   - 使用 Composition API
   - 使用 `<script setup>` 語法
   - Props 類型必須明確定義
   - 事件名稱使用 kebab-case

4. **樣式規範**
   - 優先使用 Tailwind CSS 類名
   - 組件樣式使用 scoped
   - 全局樣式放在 `assets/css`
   - Element Plus 樣式覆蓋使用 :deep()

5. **Git 提交規範**
   - feat: 新功能
   - fix: 修復問題
   - docs: 文檔變更
   - style: 代碼格式
   - refactor: 代碼重構
   - test: 測試相關
   - chore: 其他更改

## 版本資訊

- 當前版本：1.3.0
- 最後更新：2024-03-22
- 更新內容：
  1. 更新檔案系統欄位
     - 重命名欄位以提高一致性
     - 優化檔案 URL 處理
     - 改進檔案下載功能
  2. 改進工作流程功能
     - 新增檔案節點功能
     - 優化檔案預覽
     - 完善檔案處理邏輯
  3. 更新依賴版本
  4. 修復已知問題

## 待辦事項

- [ ] 實現忘記密碼功能
- [ ] 添加用戶個人資料頁面
- [ ] 優化檔案上傳體驗
- [ ] 添加數據導出功能
- [ ] 實現即時通知系統

## 貢獻指南

1. Fork 本專案
2. 創建特性分支
3. 提交您的更改
4. 推送到您的分支
5. 創建 Pull Request

## 相關資源

- [Vue 3 文檔](https://v3.vuejs.org/)
- [Element Plus 文檔](https://element-plus.org/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 聯絡方式

如有任何問題或建議，請聯繫：
- Email: john_hsiao@example.com
- GitHub Issues 