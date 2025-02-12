import Mock from "mockjs";
import {
  generateResponse,
  generateError,
  generateId,
  generateDate,
  generateAvatar,
  generateChineseName,
  generateEnglishName,
  generateEmail,
  generateRole,
} from "../utils";

// 模擬用戶數據
const users = Array.from({ length: 11 }, (_, index) => {
  const chineseName = generateChineseName();
  const englishName = generateEnglishName();
  return {
    id: generateId(),
    nickname: chineseName,
    name: `${chineseName} (${englishName})`,
    email: generateEmail(englishName),
    role: generateRole(),
    avatar: generateAvatar(index + 1),
    status: "active",
    lastLogin: generateDate(),
    createdAt: generateDate(),
    updatedAt: generateDate(),
  };
});

// 當前登入用戶
let currentUser = users[0];

// 模擬通知數據
const notifications = Array.from({ length: 10 }, () => ({
  id: generateId(),
  title: Mock.Random.ctitle(5, 15),
  content: Mock.Random.cparagraph(1, 3),
  type: Mock.Random.pick(["system", "project", "workflow", "analysis"]),
  status: Mock.Random.pick(["unread", "read"]),
  createdAt: generateDate(),
}));

// 模擬用戶設置
const userSettings = {
  theme: "light",
  language: "zh-TW",
  notification: {
    email: true,
    desktop: true,
    sound: true,
  },
  display: {
    density: "default",
    colorWeak: false,
    hideMenu: false,
  },
};

// 登入
Mock.mock("/api/user/login", "post", (options) => {
  const { username, password } = JSON.parse(options.body);

  // 模擬登入驗證
  if (username === "admin" && password === "admin123") {
    return generateResponse({
      token: "mock-token-" + generateId(),
      user: currentUser,
    });
  }

  return generateError("用戶名或密碼錯誤", 401);
});

// 登出
Mock.mock("/api/user/logout", "post", () => {
  return generateResponse(null, "登出成功");
});

// 獲取用戶資訊
Mock.mock("/api/user/info", "get", () => {
  return generateResponse(currentUser);
});

// 更新用戶資訊
Mock.mock("/api/user/info", "put", (options) => {
  const data = JSON.parse(options.body);
  currentUser = { ...currentUser, ...data, updatedAt: generateDate() };
  return generateResponse(currentUser);
});

// 更新密碼
Mock.mock("/api/user/password", "put", (options) => {
  const { oldPassword, newPassword } = JSON.parse(options.body);

  if (oldPassword === "admin123") {
    return generateResponse(null, "密碼更新成功");
  }

  return generateError("原密碼錯誤");
});

// 獲取通知列表
Mock.mock(/\/api\/user\/notifications(\?.*)?$/, "get", (options) => {
  const url = new URL(options.url, "http://dummy.com");
  const params = Object.fromEntries(url.searchParams);

  return generateResponse({
    list: notifications,
    unreadCount: notifications.filter((n) => n.status === "unread").length,
  });
});

// 標記通知為已讀
Mock.mock(/\/api\/user\/notifications\/.*\/read$/, "put", (options) => {
  const id = options.url.split("/")[4];
  const notification = notifications.find((n) => n.id === id);

  if (notification) {
    notification.status = "read";
    return generateResponse(notification);
  }

  return generateError("通知不存在");
});

// 獲取用戶設置
Mock.mock("/api/user/settings", "get", () => {
  return generateResponse(userSettings);
});

// 更新用戶設置
Mock.mock("/api/user/settings", "put", (options) => {
  const data = JSON.parse(options.body);
  Object.assign(userSettings, data);
  return generateResponse(userSettings);
});

// 上傳頭像
Mock.mock("/api/user/avatar", "post", () => {
  const avatarUrl = generateAvatar(Math.floor(Math.random() * 11));
  currentUser.avatar = avatarUrl;
  return generateResponse({ url: avatarUrl });
});

// 獲取用戶列表
Mock.mock(new RegExp("^/api/user/list"), "get", (options) => {
  console.log("Mock 服務攔截到用戶列表請求：", options);
  const responseData = {
    code: 200,
    data: {
      list: users,
      total: users.length,
      page: 1,
      pageSize: users.length,
    },
    message: "獲取用戶列表成功",
  };
  console.log("返回模擬用戶數據：", responseData);
  return responseData;
});
