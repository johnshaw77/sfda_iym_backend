import Mock from "mockjs";

// 生成隨機 ID
export const generateId = () => Mock.Random.guid();

// 生成隨機日期
export const generateDate = () => Mock.Random.datetime();

// 生成分頁數據
export const generatePagination = (data, { page = 1, pageSize = 10 } = {}) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = data.slice(start, end);

  return {
    code: 200,
    data: {
      list,
      pagination: {
        total: data.length,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    },
    message: "操作成功",
  };
};

// 生成響應數據
export const generateResponse = (data, message = "操作成功", code = 200) => {
  return {
    code,
    data,
    message,
  };
};

// 生成錯誤響應
export const generateError = (message = "操作失敗", code = 500) => {
  return {
    code,
    data: null,
    message,
  };
};

// 添加請求延遲
export const withDelay = (callback, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, delay);
  });
};

// 生成隨機用戶頭像
export const generateAvatar = (index) =>
  `/avatar/avatar${(index % 11) + 1}.png`;

// 生成隨機中文姓名
export const generateChineseName = () => Mock.Random.cname();

// 生成隨機英文名
export const generateEnglishName = () => Mock.Random.name();

// 生成隨機郵箱
export const generateEmail = (name) => {
  const domain = Mock.Random.pick(["example.com", "company.com", "tech.com"]);
  return `${name.toLowerCase().replace(/\s/g, ".")}@${domain}`;
};

// 生成隨機角色
export const generateRole = () =>
  Mock.Random.pick([
    "系統管理員",
    "資深工程師",
    "品質主管",
    "數據分析師",
    "製程工程師",
    "研發工程師",
    "專案經理",
    "測試工程師",
    "維護工程師",
    "品保工程師",
    "自動化工程師",
  ]);

// 生成隨機狀態
export const generateStatus = () =>
  Mock.Random.pick(["not_started", "in_progress", "completed", "archived"]);

// 生成隨機描述
export const generateDescription = () => Mock.Random.paragraph(1, 3);

// 生成隨機標籤
export const generateTags = (count = 3) => {
  const tags = [
    "重要",
    "緊急",
    "待處理",
    "已完成",
    "進行中",
    "已歸檔",
    "需要協助",
  ];
  return Mock.Random.shuffle(tags).slice(0, count);
};

// 生成隨機數字範圍
export const generateNumber = (min = 0, max = 100) =>
  Mock.Random.integer(min, max);

// 生成隨機百分比
export const generatePercentage = () => Mock.Random.float(0, 100, 2, 2);
